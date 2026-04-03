export default function NotebookViewer() {
  return (
    <div style={{ margin: '0 -1.5rem' }}>
      <iframe
        src="/notebook.html"
        title="Fraud Detection Notebook"
        style={{ width: '100%', height: 'calc(100vh - 80px)', border: 'none' }}
      />
    </div>
  )
}
