import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [status, setStatus] = useState<{
    validated: boolean;
    processing: boolean;
    completed: boolean;
  }>({ validated: false, processing: false, completed: false });
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const validateYouTubeUrl = (url: string): url is string => {
    const youtubePattern =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/i;
    return youtubePattern.test(url);
  };

  const handleGenerate = async () => {
    setError(null);
    setStatus({ validated: false, processing: true, completed: false });

    if (!validateYouTubeUrl(youtubeUrl)) {
      setError("Insira um link válido do YouTube.");
      setStatus({ validated: false, processing: false, completed: false });
      return;
    }

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ youtube_url: youtubeUrl }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setStatus({ validated: false, processing: false, completed: false });
        return;
      }

      // Process immediately (no polling needed since no database)
      setStatus({ validated: true, processing: true, completed: false });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Process the video project
      const processResponse = await fetch(`/api/projects/${data.project.id}/process`, {
        method: "POST",
      });

      const processData = await processResponse.json();

      if (processData.error) {
        setError(processData.error);
        setStatus({ validated: true, processing: false, completed: false });
        return;
      }

      // Show results - video ready for download
      setStatus({
        validated: true,
        processing: false,
        completed: true,
      });

      // Add project to list for display
      setProjects((prev) => [...prev, data.project]);

    } catch (err) {
      console.error(err);
      setError("Erro ao processar solicitação.");
      setStatus({
        validated: true,
        processing: false,
        completed: false,
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este projeto?")) {
      const resp = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      const data = await resp.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (selectedProject?.id === id) {
          setSelectedProject(null);
        }
      }
    }
  };

  if (status.processing || status.validated) {
    return (
      <div className="processing-screen">
        <h2>Transforme vídeos do YouTube em cortes rápidos</h2>
        <p>Cole o link de um vídeo e deixe a IA encontrar os melhores momentos.</p>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: status.processing ? "30%" : "100%" }}
            >
            </div>
          </div>
          <p className="progress-text">
            {status.validated
              ? "Processando seu vídeo..."
              : "Validando URL..."}
          </p>
          <p>{error || ""}</p>
        </div>

        <div className="steps">
          <div className={status.validated ? "step completed" : "step"}>
            ✓ Link validado
          </div>
          <div className={status.validated ? "step completed" : "step"}>
            ✓ Vídeo processado
          </div>
          <div className={status.validated ? "step completed" : "step"}>
            ✓ Áudio extraído
          </div>
          <div className={status.validated ? "step completed" : "step"}>
            ✓ Transcrição realizada
          </div>
          <div className={status.processing ? "step running" : "step"}>
            → Analisando melhores momentos
          </div>
          <div className={status.processing ? "step running" : "step"}>
            ○ Criando cortes
          </div>
          <div className={status.processing ? "step running" : "step"}>
            ○ Gerando legendas
          </div>
          <div className={status.processing ? "step running" : "step"}>
            ○ Finalizando vídeos
          </div>
        </div>
      </div>
    );
  }

  // If we have projects, display them
  if (selectedProject && projects.length > 0) {
    const project = projects.find((p) => p.id === selectedProject.id);
    if (!project) return null;

    const clips = project.clips || [];

    return (
      <div className="results-screen">
        <header>
          <h1>Seus cortes estão prontos!</h1>
          <p>Processamento concluído com sucesso</p>
        </header>

        <div className="project-info">
          <p>Vídeo: {project.youtube_url}</p>
          <p>Status: Concluído</p>
        </div>

        <section className="clips-grid">
          {clips.map((clip) => (
            <div key={clip.id} className="clip-card">
              <div className="clip-preview">
                <video controls className="clip-video">
                  <source
                    src={clip.video_url}
                    type="video/mp4"
                  />
                  Seu navegador não suporta vídeo HTML5.
                </video>
              </div>
              <div className="clip-details">
                <h3>{clip.title}</h3>
                <p className="clip-duration">{clip.duration} segundos</p>
                <div className="clip-actions">
                  <button className="view-btn">▶ Visualizar</button>
                  <button className="download-btn" onClick={() => window.open(clip.video_url, '_blank')}>
                    baixar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="back-link">
          <a href="/">← Voltar para novo corte</a>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>Transforme vídeos do YouTube em cortes rápidos</h1>
        <p>
          "Cole o link de um vídeo e deixe a IA encontrar os melhores momentos."
        </p>
      </header>

      <main>
        <div className="url-input-wrapper">
          <div className="url-input-group">
            <label htmlFor="youtube-url" className="url-label">
              Cole aqui o link do YouTube
            </label>
            <input
              type="text"
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={status.processing}
            />
            <button
              type="button"
              className="generate-btn"
              onClick={handleGenerate}
              disabled={status.processing}
            >
              {status.processing ? "Processando..." : "GERAR CORTES"}
            </button>
          </div>
        </div>
      </main>

      <section className="features">
        <div className="feature-card">
          <h3>Cortes de 30 a 90 segundos</h3>
          <p>Cada corte tem entre 30 e 90 segundos, com preferência de 40-70 segundos.</p>
        </div>
        <div className="feature-card">
          <h3>Legendas automáticas</h3>
          <p>Legendas geradas automaticamente com timestamps precisos.</p>
        </div>
        <div className="feature-card">
          <h3>Formato vertical 9:16</h3>
          <p>Todos os cortes são convertidos para 1080x1920 (9:16).</p>
        </div>
      </section>
    </div>
  );
}

export default App;