export function Tips() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      {[
        {
          icon: '💬',
          title: ' Pregúntanos lo que quieras',
          desc: 'Resolvemos tus dudas sobre nuestras avenas: variedades, usos y beneficios.',
        },
        {
          icon: '🧋',
          title: 'Todo sobre nuestros productos',
          desc: 'Conoce los ingredientes, formas de consumo y qué hace especial a cada tipo de avena.',
        },
      ].map((item, index) => (
        <div
          key={index}
          className="bg-anaboli-secondary p-4 rounded-xl border border-anaboli-accent flex flex-col items-center text-center hover:bg-anaboli-accent transition-colors duration-200"
        >
          <div className="text-2xl mb-2">{item.icon}</div>
          <h3 className="font-medium text-white mb-1">{item.title}</h3>
          <p className="text-sm text-gray-400">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
