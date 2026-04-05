export default function NotebookViewer() {
  return (
    <div style={{ margin: '0 -1.5rem' }}>
      <div className="d-flex justify-content-end px-3 py-2" style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
        <a
          href="/fraud_detection.ipynb"
          download="fraud_detection.ipynb"
          className="btn btn-sm btn-outline-primary"
        >
          ⬇ Download .ipynb
        </a>
      </div>
      <iframe
        src="/notebook.html"
        title="Fraud Detection Notebook"
        style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none' }}
      />
    </div>
  )
}
