import '../globals.css';

export const metadata = {
  title: "Barmods — Pterodactyl Creator",
  description: "Create Pterodactyl user & server"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="root-body">
        {children}
      </body>
    </html>
  );
}
