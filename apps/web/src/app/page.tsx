const features = [
  ["Agenda sin cruces", "Disponibilidad centralizada para todas las canchas del complejo."],
  ["Cobros propios", "Cada complejo conecta su cuenta de Mercado Pago de forma segura."],
  ["Todo en un panel", "Reservas, clientes, horarios y pagos en una sola vista."],
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#">PADEL<span>HUB</span></a>
        <button className="ghost">Ingresar</button>
      </nav>

      <section className="hero shell">
        <div className="eyebrow">GESTION DE COMPLEJOS DEPORTIVOS</div>
        <h1>La cancha llena.<br /><em>La agenda ordenada.</em></h1>
        <p>PadelHub reúne reservas, horarios, clientes y cobros para que administres tu complejo sin perder tiempo.</p>
        <div className="actions">
          <button className="primary">Quiero administrar mi complejo</button>
          <a href="#features">Ver cómo funciona →</a>
        </div>
      </section>

      <section className="features shell" id="features">
        {features.map(([title, description], index) => (
          <article key={title}>
            <div className="number">0{index + 1}</div>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
