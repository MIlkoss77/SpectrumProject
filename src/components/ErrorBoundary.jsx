import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, err:null } }
  static getDerivedStateFromError(err){ return { hasError:true, err } }
  componentDidCatch(error, info){ console.error('[ErrorBoundary]', error, info) }
  render(){
    if(!this.state.hasError) return this.props.children
    return (
      <div style={{
        minHeight:'100vh', display:'grid', placeItems:'center',
        background:'var(--bg,#0b1220)', color:'#e7ecf3', padding:24
      }}>
        <div style={{maxWidth:640}}>
          <h2 style={{margin:'0 0 8px'}}>Что-то пошло не так</h2>
          <p style={{opacity:.8, margin:'0 0 16px'}}>UI продолжает работать — вернись назад или обнови страницу.</p>
          <pre style={{
            whiteSpace:'pre-wrap', overflow:'auto', background:'#0f1a2b',
            border:'1px solid #1d2b45', borderRadius:8, padding:12, fontSize:12
          }}>
{String(this.state.err?.message || this.state.err || 'Unknown error')}
          </pre>
          <div style={{marginTop:16, display:'flex', gap:8}}>
            <button className="dx-btn" onClick={()=>window.history.back()}>← Назад</button>
            <button className="dx-btn" onClick={()=>window.location.reload()}>Перезагрузить</button>
          </div>
        </div>
      </div>
    )
  }
}
