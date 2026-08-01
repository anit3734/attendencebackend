export const metadata = {
  title: 'Attendance Backend API',
  description: 'Production Ready Attendance System REST API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#090D16' }}>{children}</body>
    </html>
  );
}
