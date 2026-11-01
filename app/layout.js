export const metadata = {
  title: 'Sistema Integral de Lealtad',
  description: 'Panel de administración y lealtad',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}