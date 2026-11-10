import './index.css';

export default function Contato() {
  return (
    <div className="contato">
      <h1>Contato</h1>
      <p>Entre em contato conosco através do formulário abaixo:</p>
      <form>
        <label htmlFor="nome">Nome:</label>
        <input type="text" id="nome" name="nome" required /> 
        
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />    
      </form>
    </div>/
  );
}