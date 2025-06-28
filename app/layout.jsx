// app/layout.jsx
export const metadata = {
  title: 'PromptPool',
  description: 'Submit prompts, earn crypto.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
