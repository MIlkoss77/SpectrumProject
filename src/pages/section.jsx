import React from 'react'

export default function Section({ title, children }) {
  return (
    <div className="dx-panels" style={{ padding: 16 }}>
      <div className="dx-card">
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div style={{ color: '#7A7F87', marginTop: 8 }}>Заглушка страницы «{title}»</div>
        <div style={{ marginTop: 16 }}>{children}</div>
      </div>
    </div>
  )
}
