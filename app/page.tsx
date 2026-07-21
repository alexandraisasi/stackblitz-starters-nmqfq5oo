'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://dwfxvrmujekklftafhjo.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Znh2cm11amVra2xmdGFmaGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTM4MjYsImV4cCI6MjA5OTk2OTgyNn0.4jWlQdnS51Bz4ZbB27abgkhOFE3fCjBpSvjgZ9c0SAE')

const CATEGORIAS_GASTOS = ['General','Alquiler','Servicios','Insumos','Transporte','Repuestos','Salarios','Otros']
const EMPLEADOS = ['Nery','Alexandra']
const CONTACTO = { tel:'0972 963 750', instagram:'nerycell_', facebook:'NeryCell', tiktok:'nerycell3' }

export default function Home() {
  const [modoOscuro, setModoOscuro] = useState(true)
  const [seccion, setSeccion] = useState('dashboard')
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [reparaciones, setReparaciones] = useState([])
  const [clientes, setClientes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [gastos, setGastos] = useState([])
  const [cajaRegistros, setCajaRegistros] = useState([])
  const [pagosCuotas, setPagosCuotas] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [tipoModal, setTipoModal] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas')
  const [ticketVenta, setTicketVenta] = useState(null)
  const [ticketRep, setTicketRep] = useState(null)
  const [fotoPreview, setFotoPreview] = useState('')
  const [mesBalance, setMesBalance] = useState(new Date().getMonth())
  const [anioBalance, setAnioBalance] = useState(new Date().getFullYear())
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [productoVenta, setProductoVenta] = useState(null)
  const fileRef = useRef(null)

  const [formProducto, setFormProducto] = useState({ nombre:'', precio_compra:'', precio_venta:'', stock_actual:'', imei:'', categoria:'General', foto_url:'' })
  const [formVenta, setFormVenta] = useState({ cliente_nombre:'', nombre_producto:'', precio_unitario:'', cantidad:'1', metodo_pago:'Efectivo', tipoDescuento:'ninguno', descuento:'', cuotas_total:'2' })
  const [formReparacion, setFormReparacion] = useState({ cliente_nombre:'', cliente_telefono:'', cliente_direccion:'', modelo_celular:'', problema_reportado:'', tecnico:'Marcos', costo_estimado:'', garantia:'Sin garantía', observaciones:'' })
  const [formCliente, setFormCliente] = useState({ nombre:'', apellido:'', telefono:'', whatsapp:'', ciudad:'Quiindy' })
  const [formGasto, setFormGasto] = useState({ descripcion:'', categoria:'General', monto:'', fecha: new Date().toISOString().split('T')[0] })
  const [formPago, setFormPago] = useState({ monto:'', empleado:'Nery', observaciones:'' })
  const [formCaja, setFormCaja] = useState({ tipo:'apertura', empleado:'Nery', monto_inicial:'', observaciones:'' })

  const c = modoOscuro ? {
    bg:'#0A0F1E', sidebar:'#111827', card:'#141d30', card2:'#1e2a42',
    border:'rgba(255,255,255,0.07)', text:'#E8EEFF', muted:'#7A8BAA',
    input:'rgba(255,255,255,0.05)', inputBorder:'rgba(255,255,255,0.1)',
    topbar:'#111827', overlay:'rgba(0,0,0,0.75)', modal:'#111827',
  } : {
    bg:'#F0F4FF', sidebar:'#fff', card:'#fff', card2:'#F8FAFF',
    border:'rgba(0,0,0,0.08)', text:'#111827', muted:'#6B7280',
    input:'rgba(0,0,0,0.04)', inputBorder:'rgba(0,0,0,0.1)',
    topbar:'#fff', overlay:'rgba(0,0,0,0.5)', modal:'#fff',
  }

  useEffect(() => { cargarTodo() }, [])

  async function cargarTodo() {
    const [{ data: v }, { data: r }, { data: p }, { data: cl }, { data: cat }, { data: g }, { data: caja }, { data: pagos }] = await Promise.all([
      supabase.from('ventas').select('*').order('created_at', { ascending: false }),
      supabase.from('reparaciones').select('*').order('fecha_ingreso', { ascending: false }),
      supabase.from('productos').select('*').eq('activo', true).order('nombre'),
      supabase.from('clientes').select('*').order('nombre'),
      supabase.from('mis_categorias').select('*').order('nombre'),
      supabase.from('gastos').select('*').order('fecha', { ascending: false }),
      supabase.from('caja').select('*').order('created_at', { ascending: false }),
      supabase.from('pagos_cuotas').select('*').order('created_at', { ascending: false }),
    ])
    setVentas(v || [])
    setReparaciones(r || [])
    setProductos(p || [])
    setClientes(cl || [])
    setCategorias(cat || [])
    setGastos(g || [])
    setCajaRegistros(caja || [])
    setPagosCuotas(pagos || [])
  }

  function calcularDescuentoGs() {
    const subtotal = Number(formVenta.precio_unitario) * Number(formVenta.cantidad)
    if (formVenta.tipoDescuento === 'guaranies') return Number(formVenta.descuento || 0)
    if (formVenta.tipoDescuento === 'porcentaje') return subtotal * Number(formVenta.descuento || 0) / 100
    return 0
  }
  function calcularTotal() {
    const subtotal = Number(formVenta.precio_unitario) * Number(formVenta.cantidad)
    return Math.max(0, subtotal - calcularDescuentoGs())
  }

  async function agregarCategoria() {
    if (!nuevaCategoria.trim()) return
    await supabase.from('mis_categorias').insert({ nombre: nuevaCategoria.trim() })
    setNuevaCategoria(''); cargarTodo()
  }
  async function eliminarCategoria(id) {
    if (!confirm('¿Eliminar?')) return
    await supabase.from('mis_categorias').delete().eq('id', id); cargarTodo()
  }

  async function guardarProducto() {
    await supabase.from('productos').insert({
      nombre: formProducto.nombre, precio_compra: Number(formProducto.precio_compra),
      precio_venta: Number(formProducto.precio_venta), stock_actual: Number(formProducto.stock_actual),
      imei: formProducto.imei || null, sucursal: 'Quiindy',
      categoria: formProducto.categoria, foto_url: formProducto.foto_url || null,
    })
    setShowModal(false)
    setFormProducto({ nombre:'', precio_compra:'', precio_venta:'', stock_actual:'', imei:'', categoria:'General', foto_url:'' })
    setFotoPreview(''); cargarTodo()
  }

  function abrirVentaDesdeProducto(p) {
    setProductoVenta(p)
    setFormVenta({ ...formVenta, nombre_producto: p.nombre, precio_unitario: String(p.precio_venta) })
    setTipoModal('venta'); setShowModal(true)
  }

  async function eliminarProducto(id) { if (!confirm('¿Eliminar?')) return; await supabase.from('productos').update({ activo: false }).eq('id', id); cargarTodo() }
  async function eliminarVenta(id) { if (!confirm('¿Eliminar?')) return; await supabase.from('ventas').delete().eq('id', id); cargarTodo() }
  async function eliminarReparacion(id) { if (!confirm('¿Eliminar?')) return; await supabase.from('reparaciones').delete().eq('id', id); cargarTodo() }
  async function eliminarCliente(id) { if (!confirm('¿Eliminar?')) return; await supabase.from('clientes').delete().eq('id', id); cargarTodo() }
  async function eliminarGasto(id) { if (!confirm('¿Eliminar?')) return; await supabase.from('gastos').delete().eq('id', id); cargarTodo() }

  async function guardarVenta() {
    const total = calcularTotal()
    const descuentoGs = calcularDescuentoGs()
    const cuotas = Number(formVenta.cuotas_total)
    const esCuota = formVenta.metodo_pago === 'Cuotas' && cuotas > 1
    const montoCuota = esCuota ? Math.ceil(total / cuotas) : total
    const { data } = await supabase.from('ventas').insert({
      cliente_nombre: formVenta.cliente_nombre, nombre_producto: formVenta.nombre_producto,
      precio_unitario: Number(formVenta.precio_unitario), cantidad: Number(formVenta.cantidad),
      descuento_gs: descuentoGs, total, metodo_pago: formVenta.metodo_pago, sucursal: 'Quiindy',
      cuotas_total: cuotas, cuota_actual: esCuota ? 0 : cuotas,
      monto_cuota: montoCuota, estado_pago: esCuota ? 'Pendiente' : 'Pagado',
      saldo_pendiente: esCuota ? total : 0,
    }).select().single()
    setShowModal(false)
    setFormVenta({ cliente_nombre:'', nombre_producto:'', precio_unitario:'', cantidad:'1', metodo_pago:'Efectivo', tipoDescuento:'ninguno', descuento:'', cuotas_total:'2' })
    setProductoVenta(null); cargarTodo()
    if (data) setTicketVenta(data)
  }

  async function registrarPagoParcial() {
    const monto = Number(formPago.monto)
    if (!monto || monto <= 0) { alert('Ingresá un monto válido'); return }
    const v = ventaSeleccionada as any
    const nuevoSaldo = Math.max(0, (v.saldo_pendiente || v.total) - monto)
    await supabase.from('pagos_cuotas').insert({
      venta_id: v.id, monto, empleado: formPago.empleado,
      observaciones: formPago.observaciones || null, fecha: new Date().toISOString().split('T')[0],
    })
    await supabase.from('ventas').update({
      saldo_pendiente: nuevoSaldo,
      estado_pago: nuevoSaldo <= 0 ? 'Pagado' : 'Pendiente',
    }).eq('id', v.id)
    setShowModal(false)
    setFormPago({ monto:'', empleado:'Nery', observaciones:'' })
    setVentaSeleccionada(null); cargarTodo()
  }

  async function guardarReparacion() {
    if (!formReparacion.cliente_nombre || !formReparacion.cliente_telefono || !formReparacion.modelo_celular || !formReparacion.problema_reportado) {
      alert('Completá todos los campos obligatorios (*)'); return
    }
    const insertData: any = {
      cliente_nombre: formReparacion.cliente_nombre, cliente_telefono: formReparacion.cliente_telefono,
      cliente_direccion: formReparacion.cliente_direccion || null, modelo_celular: formReparacion.modelo_celular,
      problema_reportado: formReparacion.problema_reportado, tecnico: formReparacion.tecnico,
      garantia: formReparacion.garantia, observaciones: formReparacion.observaciones || null,
      sucursal: 'Quiindy', estado: 'Recibido', fecha_ingreso: new Date().toISOString(),
    }
    if (formReparacion.costo_estimado) insertData.costo_estimado = Number(formReparacion.costo_estimado)
    const { data, error } = await supabase.from('reparaciones').insert(insertData).select().single()
    if (error) { alert('Error: ' + error.message); return }
    setShowModal(false)
    setFormReparacion({ cliente_nombre:'', cliente_telefono:'', cliente_direccion:'', modelo_celular:'', problema_reportado:'', tecnico:'Marcos', costo_estimado:'', garantia:'Sin garantía', observaciones:'' })
    cargarTodo(); if (data) setTicketRep(data)
  }

  async function guardarCliente() {
    await supabase.from('clientes').insert(formCliente)
    setShowModal(false); setFormCliente({ nombre:'', apellido:'', telefono:'', whatsapp:'', ciudad:'Quiindy' }); cargarTodo()
  }

  async function guardarGasto() {
    if (!formGasto.descripcion || !formGasto.monto) { alert('Completá descripción y monto'); return }
    await supabase.from('gastos').insert({ descripcion: formGasto.descripcion, categoria: formGasto.categoria, monto: Number(formGasto.monto), fecha: formGasto.fecha })
    setShowModal(false); setFormGasto({ descripcion:'', categoria:'General', monto:'', fecha: new Date().toISOString().split('T')[0] }); cargarTodo()
  }

  async function guardarCaja() {
    await supabase.from('caja').insert({
      tipo: formCaja.tipo, empleado: formCaja.empleado,
      monto_inicial: Number(formCaja.monto_inicial) || 0,
      observaciones: formCaja.observaciones || null,
      fecha: new Date().toISOString().split('T')[0],
    })
    setShowModal(false); setFormCaja({ tipo:'apertura', empleado:'Nery', monto_inicial:'', observaciones:'' }); cargarTodo()
  }

  async function cambiarEstadoRep(id, estado) {
    await supabase.from('reparaciones').update({ estado }).eq('id', id); cargarTodo()
  }

  function handleFoto(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { const url = ev.target.result as string; setFotoPreview(url); setFormProducto(f => ({ ...f, foto_url: url })) }
    reader.readAsDataURL(file)
  }

  function formatGs(n) { return `Gs. ${Number(n || 0).toLocaleString('es-PY')}` }
  function formatFecha(d) { return d ? new Date(d).toLocaleDateString('es-PY') : '—' }
  function formatHora(d) { return d ? new Date(d).toLocaleTimeString('es-PY', { hour:'2-digit', minute:'2-digit' }) : '—' }

  function estadoColor(e) {
    if (e === 'Entregado') return { background:'rgba(0,217,126,0.12)', color:'#00D97E' }
    if (e === 'Terminado') return { background:'rgba(255,214,0,0.12)', color:'#FFD600' }
    if (e === 'En reparación') return { background:'rgba(91,196,245,0.12)', color:'#5BC4F5' }
    if (e === 'Recibido') return { background:'rgba(26,58,255,0.15)', color:'#6B8AFF' }
    if (e === 'Diagnóstico') return { background:'rgba(180,100,255,0.12)', color:'#B464FF' }
    return { background:'rgba(255,75,110,0.12)', color:'#FF4B6E' }
  }

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  const ventasHoy = (ventas as any[]).filter(v => new Date(v.created_at) >= hoy)
  const ventasMes = (ventas as any[]).filter(v => new Date(v.created_at) >= inicioMes)
  const gastosMes = (gastos as any[]).filter(g => { const d = new Date(g.fecha); return d.getMonth()===ahora.getMonth()&&d.getFullYear()===ahora.getFullYear() })
  const balanceHoy = ventasHoy.reduce((s,v:any)=>s+(v.total||0),0)
  const balanceMes = ventasMes.reduce((s,v:any)=>s+(v.total||0),0)
  const totalGastosMes = gastosMes.reduce((s,g:any)=>s+(g.monto||0),0)
  const gananciaNeta = balanceMes - totalGastosMes
  const efectivoMes = ventasMes.filter((v:any)=>v.metodo_pago==='Efectivo').reduce((s,v:any)=>s+(v.total||0),0)
  const transferenciaMes = ventasMes.filter((v:any)=>v.metodo_pago==='Transferencia').reduce((s,v:any)=>s+(v.total||0),0)
  const cuotasMes = ventasMes.filter((v:any)=>v.metodo_pago==='Cuotas').reduce((s,v:any)=>s+(v.total||0),0)
  const repPendientes = (reparaciones as any[]).filter(r => !['Entregado','Cancelado'].includes(r.estado))
  const stockBajo = (productos as any[]).filter(p => p.stock_actual <= p.stock_minimo)
  const ventasConDeuda = (ventas as any[]).filter(v => v.estado_pago === 'Pendiente')
  const totalDeuda = ventasConDeuda.reduce((s,v:any)=>s+(v.saldo_pendiente||0),0)
  const mesActual = ahora.toLocaleDateString('es-PY', { month:'long', year:'numeric' })

  const ventasBalance = (ventas as any[]).filter(v => { const d = new Date(v.created_at); return d.getMonth()===mesBalance&&d.getFullYear()===anioBalance })
  const gastosBalance = (gastos as any[]).filter(g => { const d = new Date(g.fecha); return d.getMonth()===mesBalance&&d.getFullYear()===anioBalance })
  const totalVentasBalance = ventasBalance.reduce((s,v:any)=>s+(v.total||0),0)
  const totalGastosBalance = gastosBalance.reduce((s,g:any)=>s+(g.monto||0),0)
  const gananciaNetaBalance = totalVentasBalance - totalGastosBalance
  const efectivoBalance = ventasBalance.filter((v:any)=>v.metodo_pago==='Efectivo').reduce((s,v:any)=>s+(v.total||0),0)
  const transferenciaBalance = ventasBalance.filter((v:any)=>v.metodo_pago==='Transferencia').reduce((s,v:any)=>s+(v.total||0),0)
  const cuotasBalance = ventasBalance.filter((v:any)=>v.metodo_pago==='Cuotas').reduce((s,v:any)=>s+(v.total||0),0)

  const masVendidos = Object.entries(ventasMes.reduce((acc:any,v:any)=>{ const key=v.nombre_producto||'Sin nombre'; acc[key]=(acc[key]||0)+(v.cantidad||1); return acc },{})).sort((a:any,b:any)=>b[1]-a[1]).slice(0,5)
  const listaCategorias = ['Todas', ...(categorias as any[]).map((cat:any)=>cat.nombre)]
  const productosFiltrados = (productos as any[]).filter(p => { const matchB=p.nombre.toLowerCase().includes(busqueda.toLowerCase())||(p.imei&&p.imei.includes(busqueda)); const matchC=categoriaFiltro==='Todas'||p.categoria===categoriaFiltro; return matchB&&matchC })
  const productosAgrupados = (categorias as any[]).reduce((acc,cat:any)=>{ const prods=(productos as any[]).filter(p=>p.categoria===cat.nombre); if(prods.length>0) acc[cat.nombre]=prods; return acc },{} as any)
  const subtotalVenta = Number(formVenta.precio_unitario)*Number(formVenta.cantidad)
  const descuentoGs = calcularDescuentoGs()
  const totalVenta = calcularTotal()

  // Caja - estado actual
  const ultimasCajas = (cajaRegistros as any[]).slice(0,5)
  const cajaHoy = (cajaRegistros as any[]).filter(c => { const d = new Date(c.created_at); return d >= hoy })
  const cajaAbierta = cajaHoy.find(c => c.tipo==='apertura')
  const cajaCerrada = cajaHoy.find(c => c.tipo==='cierre')
  const estadoCaja = cajaAbierta && !cajaCerrada ? 'abierta' : cajaCerrada ? 'cerrada' : 'sin abrir'

  const s = {
    app:{ display:'flex', minHeight:'100vh', background:c.bg, fontFamily:'sans-serif', transition:'all .2s' },
    sidebar:{ width:210, minWidth:210, background:c.sidebar, borderRight:`1px solid ${c.border}`, display:'flex', flexDirection:'column' as const },
    main:{ flex:1, display:'flex', flexDirection:'column' as const },
    topbar:{ height:56, background:c.topbar, borderBottom:`1px solid ${c.border}`, display:'flex', alignItems:'center', padding:'0 24px', gap:12 },
    content:{ flex:1, padding:'20px 24px', overflowY:'auto' as const },
    card:{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:18, marginBottom:14 },
    grid4:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 },
    grid2:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 },
    input:{ width:'100%', background:c.input, border:`1px solid ${c.inputBorder}`, borderRadius:10, padding:'9px 12px', color:c.text, fontSize:13, fontFamily:'sans-serif', outline:'none', marginBottom:10, boxSizing:'border-box' as const },
    btnYellow:{ background:'#FFD600', color:'#0D0D0D', border:'none', borderRadius:50, padding:'8px 18px', fontSize:13, fontWeight:600 as const, cursor:'pointer' },
    btnRed:{ background:'rgba(255,75,110,0.15)', color:'#FF4B6E', border:'1px solid rgba(255,75,110,0.3)', borderRadius:50, padding:'5px 10px', fontSize:11, cursor:'pointer' },
    btnBlue:{ background:'rgba(26,58,255,0.1)', color:'#6B8AFF', border:'1px solid rgba(26,58,255,0.3)', borderRadius:50, padding:'5px 10px', fontSize:11, cursor:'pointer' },
    btnGreen:{ background:'rgba(0,217,126,0.15)', color:'#00D97E', border:'1px solid rgba(0,217,126,0.3)', borderRadius:50, padding:'5px 10px', fontSize:11, cursor:'pointer' },
    table:{ width:'100%', borderCollapse:'collapse' as const },
    th:{ textAlign:'left' as const, fontSize:11, color:c.muted, textTransform:'uppercase' as const, letterSpacing:'.6px', padding:'8px 10px', borderBottom:`1px solid ${c.border}` },
    td:{ padding:'10px', fontSize:13, color:c.text, borderBottom:`1px solid ${c.border}` },
    overlay:{ position:'fixed' as const, inset:0, background:c.overlay, display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 },
    modal:{ background:c.modal, border:`1px solid ${c.border}`, borderRadius:20, padding:24, width:'100%', maxWidth:460, maxHeight:'90vh', overflowY:'auto' as const },
  }

  const printStyle = `@media print { body * { visibility: hidden !important; } .print-area, .print-area * { visibility: visible !important; } .print-area { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; z-index: 9999 !important; } .no-print { display: none !important; } }`

  function NavItem({id,label,emoji,badge,badgeColor='red'}:any) {
    const active = seccion===id
    return (
      <div onClick={()=>{setSeccion(id);setBusqueda('');setCategoriaFiltro('Todas')}} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:10, cursor:'pointer', color:active?'#6B8AFF':c.muted, background:active?'rgba(26,58,255,0.15)':'transparent', fontSize:13, fontWeight:active?500:400, marginBottom:2 }}>
        <span>{emoji}</span><span style={{flex:1}}>{label}</span>
        {badge>0&&<span style={{background:badgeColor==='yellow'?'#FFD600':'#FF4B6E',color:badgeColor==='yellow'?'#000':'#fff',fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:50}}>{badge}</span>}
      </div>
    )
  }

  function StatCard({label,value,color,emoji,sub=null}:any) {
    return (
      <div style={{...s.card,marginBottom:0}}>
        <div style={{fontSize:20,marginBottom:8}}>{emoji}</div>
        <div style={{fontSize:11,color:c.muted,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:4}}>{label}</div>
        <div style={{fontSize:20,fontWeight:700,color}}>{value}</div>
        {sub&&<div style={{fontSize:11,color:c.muted,marginTop:4}}>{sub}</div>}
      </div>
    )
  }

  function Label({text}:any) {
    return <div style={{fontSize:11,color:c.muted,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:6}}>{text}</div>
  }

  function ProductoCard({p}:any) {
    return (
      <div style={{background:c.card2,border:`1px solid ${c.border}`,borderRadius:12,padding:12,cursor:'pointer',transition:'border-color .15s'}}
        onMouseEnter={e=>(e.currentTarget as any).style.borderColor='rgba(26,58,255,0.5)'}
        onMouseLeave={e=>(e.currentTarget as any).style.borderColor=c.border}>
        {p.foto_url&&<img src={p.foto_url} alt={p.nombre} style={{width:'100%',height:90,objectFit:'cover',borderRadius:8,marginBottom:8}} />}
        <div style={{fontWeight:600,fontSize:13,color:c.text,marginBottom:4}}>{p.nombre}</div>
        <div style={{fontSize:11,color:c.muted}}>Venta: {formatGs(p.precio_venta)}</div>
        <div style={{fontSize:11,color:'#00D97E',marginBottom:8}}>+{formatGs(p.precio_venta-p.precio_compra)}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:6}}>
          <span style={{fontSize:11,color:p.stock_actual<=p.stock_minimo?'#FF4B6E':c.muted}}>Stock: {p.stock_actual}{p.stock_actual<=p.stock_minimo&&' ⚠️'}</span>
          <div style={{display:'flex',gap:4}}>
            <button style={{...s.btnYellow,padding:'4px 10px',fontSize:11}} onClick={()=>abrirVentaDesdeProducto(p)}>💰 Vender</button>
            <button style={{...s.btnRed,padding:'4px 8px'}} onClick={()=>eliminarProducto(p.id)}>🗑</button>
          </div>
        </div>
      </div>
    )
  }

  function PaginaBalance() {
    return (
      <div style={{background:'#fff',color:'#111',padding:'40px',maxWidth:794,margin:'0 auto',fontFamily:'Arial,sans-serif'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:'3px solid #1A3AFF',paddingBottom:16,marginBottom:20}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,color:'#1A3AFF'}}>NERY CELL</div>
            <div style={{fontSize:11,color:'#666'}}>Tecnología · Accesorios · Reparaciones</div>
            <div style={{fontSize:11,color:'#666'}}>Quiindy, Paraguarí · {CONTACTO.tel}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:16,fontWeight:700}}>BALANCE MENSUAL</div>
            <div style={{fontSize:14,color:'#1A3AFF',fontWeight:600}}>{MESES[mesBalance]} {anioBalance}</div>
            <div style={{fontSize:11,color:'#666'}}>Generado: {new Date().toLocaleDateString('es-PY')}</div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total ingresos',value:formatGs(totalVentasBalance),color:'#1A3AFF'},{label:'Total gastos',value:formatGs(totalGastosBalance),color:'#FF4B6E'},{label:'Ganancia neta',value:formatGs(gananciaNetaBalance),color:gananciaNetaBalance>=0?'#00A86B':'#FF4B6E'}].map(item=>(
            <div key={item.label} style={{border:'2px solid #eee',borderRadius:10,padding:14,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#888',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>{item.label}</div>
              <div style={{fontSize:18,fontWeight:700,color:item.color}}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
          {[{label:'Efectivo',value:formatGs(efectivoBalance),color:'#00A86B'},{label:'Transferencia',value:formatGs(transferenciaBalance),color:'#0066CC'},{label:'Cuotas',value:formatGs(cuotasBalance),color:'#FF8C00'}].map(item=>(
            <div key={item.label} style={{background:'#F8FAFF',borderRadius:8,padding:10,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#888',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:3}}>{item.label}</div>
              <div style={{fontSize:14,fontWeight:700,color:item.color}}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:12,fontWeight:700,marginBottom:8,color:'#1A3AFF',textTransform:'uppercase',letterSpacing:'.5px'}}>Detalle de ventas ({ventasBalance.length})</div>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:20}}>
          <thead><tr style={{background:'#1A3AFF'}}>{['Fecha','Producto','Cliente','Cant.','Descuento','Método','Estado','Total'].map(h=><th key={h} style={{color:'#fff',fontSize:10,padding:'7px 8px',textAlign:'left',fontWeight:600}}>{h}</th>)}</tr></thead>
          <tbody>
            {ventasBalance.length===0&&<tr><td colSpan={8} style={{padding:16,textAlign:'center',color:'#888',fontSize:12}}>Sin ventas en este período</td></tr>}
            {ventasBalance.map((v:any,i)=>(
              <tr key={v.id} style={{background:i%2===0?'#F8FAFF':'#fff'}}>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee'}}>{formatFecha(v.created_at)}</td>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee',fontWeight:500}}>{v.nombre_producto||'—'}</td>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee'}}>{v.cliente_nombre||'—'}</td>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee',textAlign:'center'}}>{v.cantidad}</td>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee',color:'#FF4B6E'}}>{v.descuento_gs>0?`-${formatGs(v.descuento_gs)}`:'—'}</td>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee'}}>{v.metodo_pago}</td>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee'}}><span style={{background:v.estado_pago==='Pagado'?'#00A86B':'#FF8C00',color:'#fff',padding:'1px 6px',borderRadius:50,fontSize:9}}>{v.estado_pago||'Pagado'}</span></td>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee',fontWeight:600,color:'#1A3AFF'}}>{formatGs(v.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr style={{background:'#1A3AFF'}}><td colSpan={7} style={{padding:'7px 8px',color:'#fff',fontWeight:700,fontSize:12}}>TOTAL INGRESOS</td><td style={{padding:'7px 8px',color:'#FFD600',fontWeight:700,fontSize:14}}>{formatGs(totalVentasBalance)}</td></tr></tfoot>
        </table>
        <div style={{fontSize:12,fontWeight:700,marginBottom:8,color:'#FF4B6E',textTransform:'uppercase',letterSpacing:'.5px'}}>Detalle de gastos ({gastosBalance.length})</div>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:20}}>
          <thead><tr style={{background:'#FF4B6E'}}>{['Fecha','Descripción','Categoría','Monto'].map(h=><th key={h} style={{color:'#fff',fontSize:10,padding:'7px 8px',textAlign:'left',fontWeight:600}}>{h}</th>)}</tr></thead>
          <tbody>
            {gastosBalance.length===0&&<tr><td colSpan={4} style={{padding:16,textAlign:'center',color:'#888',fontSize:12}}>Sin gastos en este período</td></tr>}
            {gastosBalance.map((g:any,i)=>(
              <tr key={g.id} style={{background:i%2===0?'#FFF8F8':'#fff'}}>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee'}}>{formatFecha(g.fecha)}</td>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee',fontWeight:500}}>{g.descripcion}</td>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee'}}>{g.categoria}</td>
                <td style={{padding:'6px 8px',fontSize:11,borderBottom:'1px solid #eee',fontWeight:600,color:'#FF4B6E'}}>{formatGs(g.monto)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr style={{background:'#FF4B6E'}}><td colSpan={3} style={{padding:'7px 8px',color:'#fff',fontWeight:700,fontSize:12}}>TOTAL GASTOS</td><td style={{padding:'7px 8px',color:'#fff',fontWeight:700,fontSize:14}}>{formatGs(totalGastosBalance)}</td></tr></tfoot>
        </table>
        <div style={{background:gananciaNetaBalance>=0?'#F0FFF8':'#FFF0F0',border:`2px solid ${gananciaNetaBalance>=0?'#00A86B':'#FF4B6E'}`,borderRadius:12,padding:16,marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>Ganancia neta del mes</div><div style={{fontSize:11,color:'#666'}}>Ingresos {formatGs(totalVentasBalance)} — Gastos {formatGs(totalGastosBalance)}</div></div>
          <div style={{fontSize:28,fontWeight:700,color:gananciaNetaBalance>=0?'#00A86B':'#FF4B6E'}}>{formatGs(gananciaNetaBalance)}</div>
        </div>
        <div style={{borderTop:'2px solid #1A3AFF',paddingTop:12,display:'flex',justifyContent:'space-between',fontSize:10,color:'#888'}}>
          <span>Nery Cell — Sistema de gestión interno</span>
          <span>📞 {CONTACTO.tel} · @{CONTACTO.instagram}</span>
        </div>
      </div>
    )
  }

  return (
    <div style={s.app}>
      <style>{printStyle}</style>
      <aside style={s.sidebar}>
        <div style={{padding:'20px 16px',borderBottom:`1px solid ${c.border}`}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,#1A3AFF,#5BC4F5)',borderRadius:50,padding:'6px 14px 6px 8px'}}>
            <div style={{width:28,height:28,background:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:'#1A3AFF'}}>N</div>
            <span style={{fontWeight:700,fontSize:13,color:'#fff'}}>NERY CELL</span>
          </div>
        </div>
        <nav style={{padding:'12px 10px',flex:1,overflowY:'auto'}}>
          <NavItem id="dashboard" label="Dashboard" emoji="⚡" />
          <NavItem id="stock" label="Stock" emoji="📦" badge={stockBajo.length} />
          <NavItem id="ventas" label="Ventas" emoji="💰" />
          <NavItem id="cuotas" label="Cuotas / Deudas" emoji="📋" badge={ventasConDeuda.length} badgeColor="yellow" />
          <NavItem id="tecnico" label="Técnico" emoji="🔧" badge={repPendientes.length} />
          <NavItem id="clientes" label="Clientes" emoji="👥" />
          <NavItem id="gastos" label="Gastos" emoji="💸" />
          <NavItem id="caja" label="Caja" emoji="🏦" />
          <NavItem id="balance" label="Balance" emoji="📊" />
          <NavItem id="categorias" label="Categorías" emoji="📁" />
        </nav>
        <div style={{padding:12,borderTop:`1px solid ${c.border}`}}>
          <div onClick={()=>setModoOscuro(!modoOscuro)} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:c.input,borderRadius:10,cursor:'pointer',marginBottom:8,border:`1px solid ${c.border}`}}>
            <span>{modoOscuro?'☀️':'🌙'}</span><span style={{fontSize:12,color:c.muted}}>{modoOscuro?'Modo claro':'Modo oscuro'}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:c.input,borderRadius:10}}>
            <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#1A3AFF,#5BC4F5)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,color:'#fff'}}>N</div>
            <div><div style={{fontSize:12,fontWeight:500,color:c.text}}>Nery Cell</div><div style={{fontSize:10,color:c.muted}}>Administrador</div></div>
          </div>
        </div>
      </aside>

      <div style={s.main}>
        <header style={s.topbar}>
          <span style={{fontWeight:700,fontSize:15,color:c.text}}>
            {seccion==='dashboard'&&'⚡ Dashboard'}{seccion==='stock'&&'📦 Stock'}{seccion==='ventas'&&'💰 Ventas'}
            {seccion==='cuotas'&&'📋 Cuotas y Deudas'}{seccion==='tecnico'&&'🔧 Servicio Técnico'}{seccion==='clientes'&&'👥 Clientes'}
            {seccion==='gastos'&&'💸 Gastos'}{seccion==='caja'&&'🏦 Caja'}{seccion==='balance'&&'📊 Balance'}{seccion==='categorias'&&'📁 Categorías'}
          </span>
          <div style={{marginLeft:'auto',display:'flex',gap:10,alignItems:'center'}}>
            {seccion==='stock'&&<><input style={{...s.input,marginBottom:0,maxWidth:200,padding:'7px 12px'}} placeholder="🔍 Buscar..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} /><button style={s.btnYellow} onClick={()=>{setTipoModal('producto');setShowModal(true)}}>+ Producto</button></>}
            {seccion==='ventas'&&<button style={s.btnYellow} onClick={()=>{setTipoModal('venta');setShowModal(true)}}>+ Registrar venta</button>}
            {seccion==='tecnico'&&<button style={s.btnYellow} onClick={()=>{setTipoModal('reparacion');setShowModal(true)}}>+ Registrar equipo</button>}
            {seccion==='clientes'&&<button style={s.btnYellow} onClick={()=>{setTipoModal('cliente');setShowModal(true)}}>+ Agregar cliente</button>}
            {seccion==='gastos'&&<button style={s.btnYellow} onClick={()=>{setTipoModal('gasto');setShowModal(true)}}>+ Registrar gasto</button>}
            {seccion==='caja'&&<button style={s.btnYellow} onClick={()=>{setTipoModal('caja');setShowModal(true)}}>+ Abrir / Cerrar caja</button>}
            {seccion==='balance'&&<button style={s.btnYellow} onClick={()=>window.print()}>🖨 Imprimir balance</button>}
          </div>
        </header>

        <div style={s.content}>

          {/* DASHBOARD */}
          {seccion==='dashboard'&&(
            <div>
              {stockBajo.length>0&&<div style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',background:'rgba(255,214,0,0.07)',border:'1px solid rgba(255,214,0,0.2)',borderRadius:12,marginBottom:12,fontSize:12,color:'#FFD600'}}>⚠️ <strong>{stockBajo.length} stock bajo</strong> — {stockBajo.map((p:any)=>p.nombre).join(' · ')}</div>}
              {ventasConDeuda.length>0&&<div style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',background:'rgba(255,75,110,0.07)',border:'1px solid rgba(255,75,110,0.2)',borderRadius:12,marginBottom:12,fontSize:12,color:'#FF4B6E'}}>💳 <strong>{ventasConDeuda.length} deudas pendientes</strong> — {formatGs(totalDeuda)}<button style={{...s.btnRed,marginLeft:'auto',fontSize:11}} onClick={()=>setSeccion('cuotas')}>Ver →</button></div>}
              <div style={s.grid4}>
                <StatCard label="Balance hoy" value={formatGs(balanceHoy)} color="#00D97E" emoji="📅" />
                <StatCard label={`Ingresos ${mesActual}`} value={formatGs(balanceMes)} color="#5BC4F5" emoji="📆" />
                <StatCard label={`Gastos ${mesActual}`} value={formatGs(totalGastosMes)} color="#FF4B6E" emoji="💸" />
                <StatCard label="Ganancia neta" value={formatGs(gananciaNeta)} color={gananciaNeta>=0?'#00D97E':'#FF4B6E'} emoji="💎" sub={gananciaNeta>=0?'✅ Positivo':'⚠️ Negativo'} />
              </div>
              <div style={s.grid2}>
                <div style={s.card}>
                  <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:4}}>💰 Ventas de hoy</div>
                  <div style={{fontSize:11,color:c.muted,marginBottom:12}}>{ventasHoy.length} operaciones · {formatGs(balanceHoy)}</div>
                  {ventasHoy.length===0&&<p style={{color:c.muted,fontSize:12}}>Sin ventas hoy todavía</p>}
                  {ventasHoy.map((v:any)=>(<div key={v.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${c.border}`,fontSize:13}}><span style={{color:c.text}}>{v.nombre_producto||v.cliente_nombre||'—'}</span><span style={{color:'#00D97E',fontWeight:600}}>{formatGs(v.total)}</span></div>))}
                </div>
                <div style={s.card}>
                  <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:4}}>📆 Resumen {mesActual}</div>
                  <div style={{fontSize:28,fontWeight:700,color:gananciaNeta>=0?'#00D97E':'#FF4B6E',margin:'8px 0'}}>{formatGs(gananciaNeta)}</div>
                  <div style={{fontSize:12,color:c.muted,marginBottom:3}}>📈 Ingresos: {formatGs(balanceMes)}</div>
                  <div style={{fontSize:12,color:'#FF4B6E',marginBottom:3}}>📉 Gastos: {formatGs(totalGastosMes)}</div>
                  <div style={{fontSize:12,color:c.muted,marginBottom:3}}>💵 Efectivo: {formatGs(efectivoMes)}</div>
                  <div style={{fontSize:12,color:c.muted,marginBottom:12}}>📲 Transferencia: {formatGs(transferenciaMes)}</div>
                  <button style={s.btnYellow} onClick={()=>setSeccion('balance')}>Ver balance completo →</button>
                </div>
              </div>
              <div style={s.grid2}>
                <div style={s.card}>
                  <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:12}}>🏆 Más vendidos del mes</div>
                  {masVendidos.length===0&&<p style={{color:c.muted,fontSize:12}}>Sin ventas este mes</p>}
                  {masVendidos.map(([nombre,cant]:any,i)=>(<div key={nombre} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`1px solid ${c.border}`}}><span style={{fontSize:16,width:24}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':'➡️'}</span><span style={{flex:1,fontSize:13,color:c.text}}>{nombre}</span><span style={{fontSize:12,fontWeight:600,color:'#FFD600'}}>{cant} unid.</span></div>))}
                </div>
                <div style={s.card}>
                  <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:12}}>🔧 Reparaciones pendientes</div>
                  {repPendientes.length===0&&<p style={{color:c.muted,fontSize:12}}>Sin pendientes</p>}
                  {repPendientes.slice(0,5).map((r:any)=>(<div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${c.border}`,fontSize:13}}><span style={{color:c.text}}>{r.cliente_nombre} — {r.modelo_celular}</span><span style={{...estadoColor(r.estado),padding:'2px 8px',borderRadius:50,fontSize:11}}>{r.estado}</span></div>))}
                </div>
              </div>
            </div>
          )}

          {/* STOCK */}
          {seccion==='stock'&&(
            <div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                {listaCategorias.map(cat=>(<button key={cat} onClick={()=>setCategoriaFiltro(cat)} style={{background:categoriaFiltro===cat?'#1A3AFF':c.input,color:categoriaFiltro===cat?'#fff':c.muted,border:`1px solid ${categoriaFiltro===cat?'#1A3AFF':c.border}`,borderRadius:50,padding:'5px 14px',fontSize:12,cursor:'pointer'}}>{cat}</button>))}
              </div>
              {categoriaFiltro==='Todas'&&!busqueda?(
                Object.keys(productosAgrupados).length===0?(<div style={{...s.card,textAlign:'center',color:c.muted,padding:40}}>Sin productos. ¡Agregá el primero!</div>):(
                  Object.entries(productosAgrupados).map(([cat,prods]:any)=>(
                    <div key={cat} style={s.card}>
                      <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:12}}>📁 {cat} ({prods.length})</div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10}}>
                        {prods.map((p:any)=><ProductoCard key={p.id} p={p} />)}
                      </div>
                    </div>
                  ))
                )
              ):(
                <div style={s.card}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10,marginBottom:14}}>
                    {productosFiltrados.map((p:any)=><ProductoCard key={p.id} p={p} />)}
                    {productosFiltrados.length===0&&<div style={{gridColumn:'1/-1',textAlign:'center',color:c.muted,padding:32}}>No se encontraron productos</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VENTAS */}
          {seccion==='ventas'&&(
            <div>
              <div style={s.grid4}>
                <StatCard label="Balance hoy" value={formatGs(balanceHoy)} color="#00D97E" emoji="📅" />
                <StatCard label={`Balance ${mesActual}`} value={formatGs(balanceMes)} color="#5BC4F5" emoji="📆" />
                <StatCard label="Ventas hoy" value={ventasHoy.length} color="#FFD600" emoji="🛍" />
                <StatCard label="Ventas mes" value={ventasMes.length} color="#6B8AFF" emoji="📊" />
              </div>
              <div style={s.card}>
                <table style={s.table}>
                  <thead><tr>{['Producto','Cliente','Método','Total','Saldo','Estado','Fecha','Acciones'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {ventas.length===0&&<tr><td colSpan={8} style={{...s.td,textAlign:'center',color:c.muted,padding:32}}>Sin ventas</td></tr>}
                    {(ventas as any[]).map(v=>(
                      <tr key={v.id}>
                        <td style={{...s.td,fontWeight:500}}>{v.nombre_producto||'—'}</td>
                        <td style={s.td}>{v.cliente_nombre||'—'}</td>
                        <td style={s.td}>{v.metodo_pago}</td>
                        <td style={{...s.td,color:'#00D97E',fontWeight:600}}>{formatGs(v.total)}</td>
                        <td style={{...s.td,color:v.saldo_pendiente>0?'#FF4B6E':c.muted}}>{v.saldo_pendiente>0?formatGs(v.saldo_pendiente):'—'}</td>
                        <td style={s.td}><span style={{background:v.estado_pago==='Pagado'?'rgba(0,217,126,0.12)':'rgba(255,214,0,0.12)',color:v.estado_pago==='Pagado'?'#00D97E':'#FFD600',padding:'2px 8px',borderRadius:50,fontSize:11}}>{v.estado_pago||'Pagado'}</span></td>
                        <td style={{...s.td,fontSize:11,color:c.muted}}>{formatFecha(v.created_at)}</td>
                        <td style={s.td}>
                          <div style={{display:'flex',gap:4}}>
                            <button style={s.btnBlue} onClick={()=>setTicketVenta(v)}>🧾</button>
                            {v.estado_pago==='Pendiente'&&<button style={s.btnGreen} onClick={()=>{setVentaSeleccionada(v);setTipoModal('pago');setShowModal(true)}}>💳</button>}
                            <button style={s.btnRed} onClick={()=>eliminarVenta(v.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CUOTAS */}
          {seccion==='cuotas'&&(
            <div>
              <div style={s.grid4}>
                <StatCard label="Con deuda" value={ventasConDeuda.length} color="#FF4B6E" emoji="💳" />
                <StatCard label="Total adeudado" value={formatGs(totalDeuda)} color="#FFD600" emoji="💰" />
                <StatCard label="Pagadas completas" value={(ventas as any[]).filter(v=>v.metodo_pago==='Cuotas'&&v.estado_pago==='Pagado').length} color="#00D97E" emoji="✅" />
                <StatCard label="Total en cuotas" value={(ventas as any[]).filter(v=>v.metodo_pago==='Cuotas').length} color="#5BC4F5" emoji="📋" />
              </div>
              {ventasConDeuda.length===0?(
                <div style={{...s.card,textAlign:'center',padding:40}}><div style={{fontSize:40,marginBottom:12}}>✅</div><div style={{fontSize:16,fontWeight:600,color:c.text,marginBottom:8}}>¡Sin deudas pendientes!</div></div>
              ):(
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:10}}>⚠️ Clientes con saldo pendiente</div>
                  {ventasConDeuda.map((v:any)=>{
                    const pagosDeEstaVenta = (pagosCuotas as any[]).filter(p=>p.venta_id===v.id)
                    const totalPagado = pagosDeEstaVenta.reduce((s,p:any)=>s+(p.monto||0),0)
                    return (
                      <div key={v.id} style={{...s.card}}>
                        <div style={{display:'flex',alignItems:'flex-start',gap:14}}>
                          <div style={{fontSize:22,width:44,height:44,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,75,110,0.15)',flexShrink:0}}>💳</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600,fontSize:14,color:c.text}}>{v.cliente_nombre||'Cliente'}</div>
                            <div style={{fontSize:12,color:c.muted,marginTop:2}}>{v.nombre_producto||'Producto'} · Total: {formatGs(v.total)}</div>
                            <div style={{marginTop:8,height:6,background:c.border,borderRadius:3,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${v.total>0?Math.min(100,Math.round((totalPagado/v.total)*100)):0}%`,background:'linear-gradient(90deg,#1A3AFF,#5BC4F5)',borderRadius:3}} />
                            </div>
                            <div style={{fontSize:11,color:c.muted,marginTop:4}}>Pagado: {formatGs(totalPagado)} · Saldo: {formatGs(v.saldo_pendiente||0)}</div>

                            {/* Historial de pagos de esta venta */}
                            {pagosDeEstaVenta.length>0&&(
                              <div style={{marginTop:10,background:c.card2,borderRadius:10,padding:10}}>
                                <div style={{fontSize:11,color:c.muted,marginBottom:6,textTransform:'uppercase',letterSpacing:'.5px'}}>Historial de pagos</div>
                                {pagosDeEstaVenta.map((p:any)=>(
                                  <div key={p.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'4px 0',borderBottom:`1px solid ${c.border}`}}>
                                    <span style={{color:c.muted}}>{formatFecha(p.fecha)} · {p.empleado}</span>
                                    <span style={{color:'#00D97E',fontWeight:600}}>+{formatGs(p.monto)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{textAlign:'right',flexShrink:0}}>
                            <div style={{fontSize:11,color:c.muted,marginBottom:4}}>Saldo restante</div>
                            <div style={{fontSize:18,fontWeight:700,color:'#FF4B6E',marginBottom:10}}>{formatGs(v.saldo_pendiente||0)}</div>
                            <button style={s.btnGreen} onClick={()=>{setVentaSeleccionada(v);setTipoModal('pago');setShowModal(true)}}>💰 Registrar pago</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {(ventas as any[]).filter(v=>v.metodo_pago==='Cuotas'&&v.estado_pago==='Pagado').length>0&&(
                <div style={s.card}>
                  <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:12}}>✅ Completamente pagados</div>
                  <table style={s.table}>
                    <thead><tr>{['Cliente','Producto','Total','Fecha'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(ventas as any[]).filter(v=>v.metodo_pago==='Cuotas'&&v.estado_pago==='Pagado').map(v=>(
                        <tr key={v.id}><td style={{...s.td,fontWeight:500}}>{v.cliente_nombre||'—'}</td><td style={s.td}>{v.nombre_producto||'—'}</td><td style={{...s.td,color:'#00D97E',fontWeight:600}}>{formatGs(v.total)}</td><td style={{...s.td,fontSize:11,color:c.muted}}>{formatFecha(v.created_at)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TÉCNICO */}
          {seccion==='tecnico'&&(
            <div>
              {(reparaciones as any[]).map(r=>(
                <div key={r.id} style={{...s.card,display:'flex',alignItems:'center',gap:14}}>
                  <div style={{fontSize:22,width:42,height:42,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(26,58,255,0.15)',flexShrink:0}}>📱</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500,fontSize:13,color:c.text}}>{r.cliente_nombre} — {r.cliente_telefono}</div>
                    {r.cliente_direccion&&<div style={{fontSize:11,color:c.muted}}>📍 {r.cliente_direccion}</div>}
                    <div style={{fontSize:11,color:c.muted}}>{r.modelo_celular}</div>
                    <div style={{fontSize:12,color:'#5BC4F5',marginTop:2}}>{r.problema_reportado}</div>
                    {r.costo_estimado&&<div style={{fontSize:12,color:'#FFD600',marginTop:2}}>Costo: {formatGs(r.costo_estimado)}</div>}
                    {r.garantia&&<div style={{fontSize:11,color:c.muted,marginTop:2}}>Garantía: {r.garantia}</div>}
                    {r.observaciones&&<div style={{fontSize:11,color:c.muted,marginTop:2}}>Obs: {r.observaciones}</div>}
                  </div>
                  <div style={{textAlign:'right',display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
                    <span style={{...estadoColor(r.estado),padding:'3px 10px',borderRadius:50,fontSize:11}}>{r.estado}</span>
                    <select value={r.estado} onChange={e=>cambiarEstadoRep(r.id,e.target.value)} style={{background:c.input,border:`1px solid ${c.border}`,borderRadius:8,padding:'4px 8px',color:c.text,fontSize:11,cursor:'pointer'}}>
                      <option>Recibido</option><option>Diagnóstico</option><option>Esperando repuesto</option><option>En reparación</option><option>Terminado</option><option>Entregado</option>
                    </select>
                    <div style={{display:'flex',gap:6}}>
                      <button style={s.btnBlue} onClick={()=>setTicketRep(r)}>📋 Orden</button>
                      <button style={s.btnRed} onClick={()=>eliminarReparacion(r.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
              {reparaciones.length===0&&<div style={{...s.card,textAlign:'center',color:c.muted,padding:40}}>Sin reparaciones</div>}
            </div>
          )}

          {/* CLIENTES */}
          {seccion==='clientes'&&(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
              {clientes.length===0&&<div style={{...s.card,textAlign:'center',color:c.muted,padding:40}}>Sin clientes</div>}
              {(clientes as any[]).map(cl=>(
                <div key={cl.id} style={s.card}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                    <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#1A3AFF,#5BC4F5)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,color:'#fff'}}>{cl.nombre[0]}{cl.apellido?.[0]||''}</div>
                    <div style={{flex:1}}><div style={{fontWeight:500,fontSize:13,color:c.text}}>{cl.nombre} {cl.apellido}</div><div style={{fontSize:11,color:c.muted}}>{cl.ciudad}</div></div>
                    <button style={{...s.btnRed,padding:'3px 8px'}} onClick={()=>eliminarCliente(cl.id)}>🗑</button>
                  </div>
                  {cl.telefono&&<div style={{fontSize:12,color:c.muted,marginBottom:4}}>📞 {cl.telefono}</div>}
                  {cl.whatsapp&&<a href={`https://wa.me/595${cl.whatsapp.replace(/\D/g,'').replace(/^0/,'')}`} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#00D97E',textDecoration:'none'}}>💬 WhatsApp</a>}
                </div>
              ))}
            </div>
          )}

          {/* GASTOS */}
          {seccion==='gastos'&&(
            <div>
              <div style={s.grid4}>
                <StatCard label={`Gastos ${mesActual}`} value={formatGs(totalGastosMes)} color="#FF4B6E" emoji="💸" />
                <StatCard label="Ingresos mes" value={formatGs(balanceMes)} color="#00D97E" emoji="📈" />
                <StatCard label="Ganancia neta" value={formatGs(gananciaNeta)} color={gananciaNeta>=0?'#00D97E':'#FF4B6E'} emoji="💎" />
                <StatCard label="Total registros" value={gastos.length} color="#FFD600" emoji="📋" />
              </div>
              <div style={s.card}>
                <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:12}}>📊 Gastos del mes por categoría</div>
                {CATEGORIAS_GASTOS.map(cat=>{ const total=gastosMes.filter((g:any)=>g.categoria===cat).reduce((s,g:any)=>s+(g.monto||0),0); if(total===0) return null; const pct=totalGastosMes>0?Math.round((total/totalGastosMes)*100):0; return (<div key={cat} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}><span style={{fontSize:12,color:c.text,width:100}}>{cat}</span><div style={{flex:1,height:8,background:c.border,borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#FF4B6E,#FF8C66)',borderRadius:4}} /></div><span style={{fontSize:12,fontWeight:600,color:'#FF4B6E',width:120,textAlign:'right'}}>{formatGs(total)}</span><span style={{fontSize:11,color:c.muted,width:36,textAlign:'right'}}>{pct}%</span></div>) })}
                {totalGastosMes===0&&<p style={{color:c.muted,fontSize:12}}>Sin gastos registrados este mes</p>}
              </div>
              <div style={s.card}>
                <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:12}}>📋 Todos los gastos</div>
                <table style={s.table}>
                  <thead><tr>{['Fecha','Descripción','Categoría','Monto','Acción'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {gastos.length===0&&<tr><td colSpan={5} style={{...s.td,textAlign:'center',color:c.muted,padding:32}}>Sin gastos registrados</td></tr>}
                    {(gastos as any[]).map(g=>(<tr key={g.id}><td style={{...s.td,fontSize:11,color:c.muted}}>{formatFecha(g.fecha)}</td><td style={{...s.td,fontWeight:500}}>{g.descripcion}</td><td style={s.td}><span style={{background:'rgba(255,75,110,0.1)',color:'#FF4B6E',padding:'2px 8px',borderRadius:50,fontSize:11}}>{g.categoria}</span></td><td style={{...s.td,color:'#FF4B6E',fontWeight:600}}>{formatGs(g.monto)}</td><td style={s.td}><button style={s.btnRed} onClick={()=>eliminarGasto(g.id)}>🗑</button></td></tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CAJA */}
          {seccion==='caja'&&(
            <div>
              {/* Estado actual */}
              <div style={{...s.card,background:estadoCaja==='abierta'?'rgba(0,217,126,0.07)':estadoCaja==='cerrada'?'rgba(255,75,110,0.07)':'rgba(255,214,0,0.07)',border:`1px solid ${estadoCaja==='abierta'?'rgba(0,217,126,0.3)':estadoCaja==='cerrada'?'rgba(255,75,110,0.3)':'rgba(255,214,0,0.3)'}`}}>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{fontSize:36}}>{estadoCaja==='abierta'?'🟢':estadoCaja==='cerrada'?'🔴':'🟡'}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:16,fontWeight:700,color:c.text}}>
                      {estadoCaja==='abierta'?'Caja abierta':estadoCaja==='cerrada'?'Caja cerrada':'Sin movimiento hoy'}
                    </div>
                    {cajaAbierta&&<div style={{fontSize:12,color:c.muted,marginTop:2}}>Apertura por: {cajaAbierta.empleado} a las {formatHora(cajaAbierta.created_at)}</div>}
                    {cajaCerrada&&<div style={{fontSize:12,color:c.muted,marginTop:2}}>Cierre por: {cajaCerrada.empleado} a las {formatHora(cajaCerrada.created_at)}</div>}
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:11,color:c.muted,marginBottom:4}}>Ventas del día</div>
                    <div style={{fontSize:22,fontWeight:700,color:'#00D97E'}}>{formatGs(balanceHoy)}</div>
                  </div>
                </div>
              </div>

              <div style={s.grid4}>
                <StatCard label="Ventas hoy" value={ventasHoy.length} color="#5BC4F5" emoji="🛍" />
                <StatCard label="Total hoy" value={formatGs(balanceHoy)} color="#00D97E" emoji="💰" />
                <StatCard label="Efectivo hoy" value={formatGs(ventasHoy.filter((v:any)=>v.metodo_pago==='Efectivo').reduce((s,v:any)=>s+(v.total||0),0))} color="#FFD600" emoji="💵" />
                <StatCard label="Transfer. hoy" value={formatGs(ventasHoy.filter((v:any)=>v.metodo_pago==='Transferencia').reduce((s,v:any)=>s+(v.total||0),0))} color="#6B8AFF" emoji="📲" />
              </div>

              {/* Registro de cajas */}
              <div style={s.card}>
                <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:12}}>📋 Historial de caja</div>
                <table style={s.table}>
                  <thead><tr>{['Fecha','Tipo','Empleado','Monto inicial','Hora','Obs'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {cajaRegistros.length===0&&<tr><td colSpan={6} style={{...s.td,textAlign:'center',color:c.muted,padding:32}}>Sin registros de caja</td></tr>}
                    {(cajaRegistros as any[]).map(cj=>(
                      <tr key={cj.id}>
                        <td style={{...s.td,fontSize:11,color:c.muted}}>{formatFecha(cj.fecha)}</td>
                        <td style={s.td}><span style={{background:cj.tipo==='apertura'?'rgba(0,217,126,0.12)':'rgba(255,75,110,0.12)',color:cj.tipo==='apertura'?'#00D97E':'#FF4B6E',padding:'2px 8px',borderRadius:50,fontSize:11}}>{cj.tipo==='apertura'?'🟢 Apertura':'🔴 Cierre'}</span></td>
                        <td style={{...s.td,fontWeight:500}}>{cj.empleado}</td>
                        <td style={s.td}>{cj.monto_inicial>0?formatGs(cj.monto_inicial):'—'}</td>
                        <td style={{...s.td,fontSize:11,color:c.muted}}>{formatHora(cj.created_at)}</td>
                        <td style={{...s.td,fontSize:11,color:c.muted}}>{cj.observaciones||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BALANCE */}
          {seccion==='balance'&&(
            <div>
              <div style={{...s.card,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:600,color:c.text}}>📊 Período:</div>
                <select style={{...s.input,marginBottom:0,width:'auto',padding:'7px 14px'}} value={mesBalance} onChange={e=>setMesBalance(Number(e.target.value))}>{MESES.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
                <select style={{...s.input,marginBottom:0,width:'auto',padding:'7px 14px'}} value={anioBalance} onChange={e=>setAnioBalance(Number(e.target.value))}>{[2024,2025,2026,2027].map(a=><option key={a} value={a}>{a}</option>)}</select>
                <button style={s.btnYellow} onClick={()=>window.print()}>🖨 Imprimir</button>
              </div>
              <div className="print-area" style={{border:`2px solid ${c.border}`,borderRadius:16,overflow:'hidden'}}>
                <PaginaBalance />
              </div>
            </div>
          )}

          {/* CATEGORÍAS */}
          {seccion==='categorias'&&(
            <div>
              <div style={s.card}>
                <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:14}}>➕ Crear nueva categoría</div>
                <div style={{display:'flex',gap:10}}>
                  <input style={{...s.input,marginBottom:0,flex:1}} placeholder="Ej: Fundas, Cables..." value={nuevaCategoria} onChange={e=>setNuevaCategoria(e.target.value)} onKeyDown={e=>e.key==='Enter'&&agregarCategoria()} />
                  <button style={s.btnYellow} onClick={agregarCategoria}>Agregar</button>
                </div>
              </div>
              <div style={s.card}>
                <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:14}}>📁 Tus categorías ({categorias.length})</div>
                {categorias.length===0&&<p style={{color:c.muted,fontSize:12}}>Sin categorías todavía</p>}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
                  {(categorias as any[]).map(cat=>(<div key={cat.id} style={{background:c.card2,border:`1px solid ${c.border}`,borderRadius:12,padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:500,color:c.text}}>📁 {cat.nombre}</span><button style={s.btnRed} onClick={()=>eliminarCategoria(cat.id)}>🗑</button></div>))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODALES */}
      {showModal&&(
        <div style={s.overlay} onClick={()=>setShowModal(false)}>
          <div style={s.modal} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontWeight:700,fontSize:16,color:c.text}}>
                {tipoModal==='producto'&&'📦 Nuevo producto'}{tipoModal==='venta'&&'💰 Nueva venta'}
                {tipoModal==='reparacion'&&'🔧 Registrar equipo'}{tipoModal==='cliente'&&'👥 Nuevo cliente'}
                {tipoModal==='gasto'&&'💸 Registrar gasto'}{tipoModal==='pago'&&'💳 Registrar pago'}
                {tipoModal==='caja'&&'🏦 Movimiento de caja'}
              </h2>
              <button onClick={()=>setShowModal(false)} style={{background:'rgba(255,255,255,0.06)',border:'none',color:c.muted,width:30,height:30,borderRadius:8,cursor:'pointer',fontSize:18}}>×</button>
            </div>

            {tipoModal==='producto'&&(
              <div>
                <Label text="Categoría / Carpeta" />
                <select style={s.input} value={formProducto.categoria} onChange={e=>setFormProducto({...formProducto,categoria:e.target.value})}>
                  {(categorias as any[]).map((cat:any)=><option key={cat.id}>{cat.nombre}</option>)}
                </select>
                <Label text="Nombre del producto" />
                <input style={s.input} placeholder="Ej: Case iPhone 15" value={formProducto.nombre} onChange={e=>setFormProducto({...formProducto,nombre:e.target.value})} />
                <Label text="Foto del producto" />
                <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFoto} />
                <button style={{...s.btnBlue,marginBottom:10,display:'block'}} onClick={()=>(fileRef.current as any)?.click()}>📷 Cargar foto</button>
                {fotoPreview&&<img src={fotoPreview} alt="" style={{width:'100%',height:120,objectFit:'cover',borderRadius:10,marginBottom:10}} />}
                <Label text="Precio de compra (Gs)" />
                <input style={s.input} type="number" placeholder="0" value={formProducto.precio_compra} onChange={e=>setFormProducto({...formProducto,precio_compra:e.target.value})} />
                <Label text="Precio de venta (Gs)" />
                <input style={s.input} type="number" placeholder="0" value={formProducto.precio_venta} onChange={e=>setFormProducto({...formProducto,precio_venta:e.target.value})} />
                {formProducto.precio_compra&&formProducto.precio_venta&&(
                  <div style={{background:'rgba(0,217,126,0.08)',border:'1px solid rgba(0,217,126,0.2)',borderRadius:10,padding:'8px 12px',marginBottom:10,fontSize:12,color:'#00D97E'}}>
                    Ganancia: +{formatGs(Number(formProducto.precio_venta)-Number(formProducto.precio_compra))}
                  </div>
                )}
                <Label text="Stock inicial" />
                <input style={s.input} type="number" placeholder="0" value={formProducto.stock_actual} onChange={e=>setFormProducto({...formProducto,stock_actual:e.target.value})} />
                <Label text="IMEI (solo celulares)" />
                <input style={s.input} placeholder="15 dígitos" value={formProducto.imei} onChange={e=>setFormProducto({...formProducto,imei:e.target.value})} />
                <button style={{...s.btnYellow,width:'100%',marginTop:8}} onClick={guardarProducto}>Guardar producto</button>
              </div>
            )}

            {tipoModal==='venta'&&(
              <div>
                {productoVenta&&(
                  <div style={{background:'rgba(26,58,255,0.08)',border:'1px solid rgba(26,58,255,0.2)',borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
                    {(productoVenta as any).foto_url&&<img src={(productoVenta as any).foto_url} alt="" style={{width:40,height:40,objectFit:'cover',borderRadius:8}} />}
                    <div><div style={{fontSize:13,fontWeight:600,color:c.text}}>{(productoVenta as any).nombre}</div><div style={{fontSize:11,color:c.muted}}>Precio: {formatGs((productoVenta as any).precio_venta)} · Stock: {(productoVenta as any).stock_actual}</div></div>
                    <button style={{...s.btnRed,marginLeft:'auto',padding:'3px 8px',fontSize:11}} onClick={()=>{setProductoVenta(null);setFormVenta({...formVenta,nombre_producto:'',precio_unitario:''})}}>× Quitar</button>
                  </div>
                )}
                <Label text="Nombre del producto" />
                <input style={s.input} placeholder="Ej: Samsung A15, Case iPhone..." value={formVenta.nombre_producto} onChange={e=>setFormVenta({...formVenta,nombre_producto:e.target.value})} />
                <Label text="Nombre del cliente" />
                <input style={s.input} placeholder="Nombre del cliente" value={formVenta.cliente_nombre} onChange={e=>setFormVenta({...formVenta,cliente_nombre:e.target.value})} />
                <Label text="Precio unitario (Gs)" />
                <input style={s.input} type="number" placeholder="0" value={formVenta.precio_unitario} onChange={e=>setFormVenta({...formVenta,precio_unitario:e.target.value})} />
                <Label text="Cantidad" />
                <input style={s.input} type="number" value={formVenta.cantidad} onChange={e=>setFormVenta({...formVenta,cantidad:e.target.value})} />
                <Label text="Descuento" />
                <div style={{display:'flex',gap:8,marginBottom:10}}>
                  <select style={{...s.input,marginBottom:0,width:160}} value={formVenta.tipoDescuento} onChange={e=>setFormVenta({...formVenta,tipoDescuento:e.target.value,descuento:''})}>
                    <option value="ninguno">Sin descuento</option><option value="guaranies">En Guaraníes</option><option value="porcentaje">En porcentaje %</option>
                  </select>
                  {formVenta.tipoDescuento!=='ninguno'&&<input style={{...s.input,marginBottom:0,flex:1}} type="number" placeholder={formVenta.tipoDescuento==='porcentaje'?'Ej: 10':'Ej: 5000'} value={formVenta.descuento} onChange={e=>setFormVenta({...formVenta,descuento:e.target.value})} />}
                </div>
                {subtotalVenta>0&&(
                  <div style={{background:'rgba(26,58,255,0.08)',border:'1px solid rgba(26,58,255,0.2)',borderRadius:12,padding:14,marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:c.muted,marginBottom:4}}><span>Subtotal</span><span>{formatGs(subtotalVenta)}</span></div>
                    {descuentoGs>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#FF4B6E',marginBottom:4}}><span>Descuento{formVenta.tipoDescuento==='porcentaje'?` (${formVenta.descuento}%)`:''}</span><span>-{formatGs(descuentoGs)}</span></div>}
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:700,color:'#5BC4F5',borderTop:`1px solid ${c.border}`,paddingTop:8,marginTop:4}}><span>Total</span><span>{formatGs(totalVenta)}</span></div>
                  </div>
                )}
                <Label text="Método de pago" />
                <select style={s.input} value={formVenta.metodo_pago} onChange={e=>setFormVenta({...formVenta,metodo_pago:e.target.value})}>
                  <option>Efectivo</option><option>Transferencia</option><option>Cuotas</option>
                </select>
                {formVenta.metodo_pago==='Cuotas'&&(
                  <div>
                    <div style={{background:'rgba(255,214,0,0.06)',border:'1px solid rgba(255,214,0,0.2)',borderRadius:10,padding:'10px 14px',marginBottom:10,fontSize:12,color:c.muted}}>
                      💡 Con cuotas el cliente puede pagarte cualquier monto en cualquier momento. El sistema registra cada pago y lleva el saldo automáticamente.
                    </div>
                    <Label text="Número de cuotas (estimado)" />
                    <input style={s.input} type="number" min="2" max="24" placeholder="Ej: 3" value={formVenta.cuotas_total} onChange={e=>setFormVenta({...formVenta,cuotas_total:e.target.value})} />
                    {Number(formVenta.cuotas_total)>1&&totalVenta>0&&(
                      <div style={{background:'rgba(255,214,0,0.08)',border:'1px solid rgba(255,214,0,0.2)',borderRadius:10,padding:'10px 14px',marginBottom:10,fontSize:13,color:'#FFD600',fontWeight:600}}>
                        💰 Referencia por cuota: {formatGs(Math.ceil(totalVenta/Number(formVenta.cuotas_total)))}
                      </div>
                    )}
                  </div>
                )}
                <button style={{...s.btnYellow,width:'100%',marginTop:8}} onClick={guardarVenta}>Registrar venta</button>
              </div>
            )}

            {tipoModal==='pago'&&ventaSeleccionada&&(
              <div>
                <div style={{background:'rgba(26,58,255,0.08)',border:'1px solid rgba(26,58,255,0.2)',borderRadius:12,padding:14,marginBottom:16}}>
                  <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:4}}>{(ventaSeleccionada as any).cliente_nombre||'Cliente'}</div>
                  <div style={{fontSize:12,color:c.muted,marginBottom:8}}>{(ventaSeleccionada as any).nombre_producto||'Producto'}</div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                    <span style={{color:c.muted}}>Total de la venta</span><span style={{fontWeight:600}}>{formatGs((ventaSeleccionada as any).total)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:15,marginTop:4}}>
                    <span style={{color:c.muted}}>Saldo pendiente</span><span style={{fontWeight:700,color:'#FF4B6E'}}>{formatGs((ventaSeleccionada as any).saldo_pendiente||0)}</span>
                  </div>
                </div>
                <Label text="Monto que paga ahora (Gs)" />
                <input style={s.input} type="number" placeholder={`Máx: ${(ventaSeleccionada as any).saldo_pendiente}`} value={formPago.monto} onChange={e=>setFormPago({...formPago,monto:e.target.value})} />
                {formPago.monto&&Number(formPago.monto)>0&&(
                  <div style={{background:'rgba(0,217,126,0.08)',border:'1px solid rgba(0,217,126,0.2)',borderRadius:10,padding:'10px 14px',marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                      <span style={{color:c.muted}}>Nuevo saldo después del pago</span>
                      <span style={{fontWeight:700,color:'#00D97E'}}>{formatGs(Math.max(0,((ventaSeleccionada as any).saldo_pendiente||0)-Number(formPago.monto)))}</span>
                    </div>
                  </div>
                )}
                <Label text="Empleado que recibe" />
                <select style={s.input} value={formPago.empleado} onChange={e=>setFormPago({...formPago,empleado:e.target.value})}>
                  {EMPLEADOS.map(e=><option key={e}>{e}</option>)}
                </select>
                <Label text="Observaciones (opcional)" />
                <input style={s.input} placeholder="Ej: Pago parcial, cuota de mayo..." value={formPago.observaciones} onChange={e=>setFormPago({...formPago,observaciones:e.target.value})} />
                <button style={{...s.btnYellow,width:'100%',marginTop:8}} onClick={registrarPagoParcial}>Registrar pago</button>
              </div>
            )}

            {tipoModal==='reparacion'&&(
              <div>
                <Label text="Nombre del cliente *" /><input style={s.input} placeholder="Nombre completo" value={formReparacion.cliente_nombre} onChange={e=>setFormReparacion({...formReparacion,cliente_nombre:e.target.value})} />
                <Label text="Teléfono / WhatsApp *" /><input style={s.input} placeholder="09XX XXX XXX" value={formReparacion.cliente_telefono} onChange={e=>setFormReparacion({...formReparacion,cliente_telefono:e.target.value})} />
                <Label text="Dirección (opcional)" /><input style={s.input} placeholder="Barrio, calle, referencia..." value={formReparacion.cliente_direccion} onChange={e=>setFormReparacion({...formReparacion,cliente_direccion:e.target.value})} />
                <Label text="Modelo del celular *" /><input style={s.input} placeholder="Ej: iPhone 12, Samsung A32..." value={formReparacion.modelo_celular} onChange={e=>setFormReparacion({...formReparacion,modelo_celular:e.target.value})} />
                <Label text="Problema reportado *" /><input style={s.input} placeholder="Describí el problema..." value={formReparacion.problema_reportado} onChange={e=>setFormReparacion({...formReparacion,problema_reportado:e.target.value})} />
                <Label text="Garantía" />
                <select style={s.input} value={formReparacion.garantia} onChange={e=>setFormReparacion({...formReparacion,garantia:e.target.value})}>
                  <option>Sin garantía</option><option>Display con garantía (30 días)</option><option>Display sin garantía (económico)</option><option>Garantía general (30 días)</option><option>Garantía general (15 días)</option>
                </select>
                <Label text="Técnico" />
                <select style={s.input} value={formReparacion.tecnico} onChange={e=>setFormReparacion({...formReparacion,tecnico:e.target.value})}>
                  {EMPLEADOS.map(e=><option key={e}>{e}</option>)}
                </select>
                <Label text="Costo estimado (Gs) — opcional" /><input style={s.input} type="number" placeholder="0" value={formReparacion.costo_estimado} onChange={e=>setFormReparacion({...formReparacion,costo_estimado:e.target.value})} />
                <Label text="Observaciones — opcional" /><input style={s.input} placeholder="Notas adicionales..." value={formReparacion.observaciones} onChange={e=>setFormReparacion({...formReparacion,observaciones:e.target.value})} />
                {(!formReparacion.cliente_nombre||!formReparacion.cliente_telefono||!formReparacion.modelo_celular||!formReparacion.problema_reportado)&&(
                  <div style={{background:'rgba(255,75,110,0.08)',border:'1px solid rgba(255,75,110,0.2)',borderRadius:10,padding:'8px 12px',marginBottom:10,fontSize:12,color:'#FF4B6E'}}>⚠️ Completá los campos obligatorios (*)</div>
                )}
                <button style={{...s.btnYellow,width:'100%',marginTop:8,opacity:(!formReparacion.cliente_nombre||!formReparacion.cliente_telefono||!formReparacion.modelo_celular||!formReparacion.problema_reportado)?0.5:1}}
                  onClick={guardarReparacion} disabled={!formReparacion.cliente_nombre||!formReparacion.cliente_telefono||!formReparacion.modelo_celular||!formReparacion.problema_reportado}>
                  Registrar y generar orden
                </button>
              </div>
            )}

            {tipoModal==='cliente'&&(
              <div>
                <Label text="Nombre" /><input style={s.input} placeholder="Nombre" value={formCliente.nombre} onChange={e=>setFormCliente({...formCliente,nombre:e.target.value})} />
                <Label text="Apellido" /><input style={s.input} placeholder="Apellido" value={formCliente.apellido} onChange={e=>setFormCliente({...formCliente,apellido:e.target.value})} />
                <Label text="Teléfono" /><input style={s.input} placeholder="09XX XXX XXX" value={formCliente.telefono} onChange={e=>setFormCliente({...formCliente,telefono:e.target.value})} />
                <Label text="WhatsApp" /><input style={s.input} placeholder="09XX XXX XXX" value={formCliente.whatsapp} onChange={e=>setFormCliente({...formCliente,whatsapp:e.target.value})} />
                <Label text="Ciudad" />
                <select style={s.input} value={formCliente.ciudad} onChange={e=>setFormCliente({...formCliente,ciudad:e.target.value})}><option>Quiindy</option><option>Otra</option></select>
                <button style={{...s.btnYellow,width:'100%',marginTop:8}} onClick={guardarCliente}>Guardar cliente</button>
              </div>
            )}

            {tipoModal==='gasto'&&(
              <div>
                <Label text="Descripción del gasto" /><input style={s.input} placeholder="Ej: Compra de repuestos, pago de luz..." value={formGasto.descripcion} onChange={e=>setFormGasto({...formGasto,descripcion:e.target.value})} />
                <Label text="Categoría" />
                <select style={s.input} value={formGasto.categoria} onChange={e=>setFormGasto({...formGasto,categoria:e.target.value})}>{CATEGORIAS_GASTOS.map(cat=><option key={cat}>{cat}</option>)}</select>
                <Label text="Monto (Gs)" /><input style={s.input} type="number" placeholder="0" value={formGasto.monto} onChange={e=>setFormGasto({...formGasto,monto:e.target.value})} />
                <Label text="Fecha" /><input style={s.input} type="date" value={formGasto.fecha} onChange={e=>setFormGasto({...formGasto,fecha:e.target.value})} />
                <button style={{...s.btnYellow,width:'100%',marginTop:8}} onClick={guardarGasto}>Guardar gasto</button>
              </div>
            )}

            {tipoModal==='caja'&&(
              <div>
                <Label text="Tipo de movimiento" />
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                  {[{tipo:'apertura',label:'🟢 Apertura de caja',color:'rgba(0,217,126,0.15)',border:'rgba(0,217,126,0.4)',text:'#00D97E'},{tipo:'cierre',label:'🔴 Cierre de caja',color:'rgba(255,75,110,0.15)',border:'rgba(255,75,110,0.4)',text:'#FF4B6E'}].map(opt=>(
                    <div key={opt.tipo} onClick={()=>setFormCaja({...formCaja,tipo:opt.tipo})} style={{background:formCaja.tipo===opt.tipo?opt.color:'transparent',border:`2px solid ${formCaja.tipo===opt.tipo?opt.border:c.border}`,borderRadius:12,padding:'12px',textAlign:'center',cursor:'pointer',fontSize:13,fontWeight:formCaja.tipo===opt.tipo?600:400,color:formCaja.tipo===opt.tipo?opt.text:c.muted}}>
                      {opt.label}
                    </div>
                  ))}
                </div>
                <Label text="Empleado" />
                <select style={s.input} value={formCaja.empleado} onChange={e=>setFormCaja({...formCaja,empleado:e.target.value})}>
                  {EMPLEADOS.map(e=><option key={e}>{e}</option>)}
                </select>
                {formCaja.tipo==='apertura'&&(
                  <>
                    <Label text="Monto inicial en caja (Gs)" />
                    <input style={s.input} type="number" placeholder="0" value={formCaja.monto_inicial} onChange={e=>setFormCaja({...formCaja,monto_inicial:e.target.value})} />
                  </>
                )}
                {formCaja.tipo==='cierre'&&(
                  <div style={{background:'rgba(26,58,255,0.08)',border:'1px solid rgba(26,58,255,0.2)',borderRadius:12,padding:14,marginBottom:10}}>
                    <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:8}}>Resumen del día</div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}><span style={{color:c.muted}}>Total ventas</span><span style={{color:'#00D97E',fontWeight:600}}>{formatGs(balanceHoy)}</span></div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}><span style={{color:c.muted}}>Operaciones</span><span>{ventasHoy.length}</span></div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}><span style={{color:c.muted}}>Efectivo</span><span>{formatGs(ventasHoy.filter((v:any)=>v.metodo_pago==='Efectivo').reduce((s,v:any)=>s+(v.total||0),0))}</span></div>
                  </div>
                )}
                <Label text="Observaciones (opcional)" />
                <input style={s.input} placeholder="Notas..." value={formCaja.observaciones} onChange={e=>setFormCaja({...formCaja,observaciones:e.target.value})} />
                <button style={{...s.btnYellow,width:'100%',marginTop:8}} onClick={guardarCaja}>
                  {formCaja.tipo==='apertura'?'🟢 Abrir caja':'🔴 Cerrar caja'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TICKET DE VENTA */}
      {ticketVenta&&(
        <div style={s.overlay} onClick={()=>setTicketVenta(null)}>
          <div className="print-area" style={{background:'#fff',borderRadius:16,padding:24,width:'100%',maxWidth:320,color:'#111'}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',borderBottom:'2px solid #1A3AFF',paddingBottom:12,marginBottom:12}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,#1A3AFF,#5BC4F5)',borderRadius:50,padding:'5px 14px 5px 8px',marginBottom:6}}>
                <div style={{width:22,height:22,background:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:11,color:'#1A3AFF'}}>N</div>
                <span style={{fontWeight:700,fontSize:12,color:'#fff'}}>NERY CELL</span>
              </div>
              <div style={{fontSize:11,color:'#666'}}>Tecnología · Accesorios · Reparaciones</div>
              <div style={{fontSize:10,color:'#888',marginTop:2}}>Quiindy, Paraguarí · {CONTACTO.tel}</div>
            </div>
            <div style={{fontSize:11,color:'#888',marginBottom:8,textAlign:'center'}}>COMPROBANTE DE VENTA — {formatFecha((ticketVenta as any).created_at)}</div>
            <div style={{borderTop:'1px dashed #ddd',borderBottom:'1px dashed #ddd',padding:'10px 0',marginBottom:10}}>
              {[['Producto',(ticketVenta as any).nombre_producto||'—'],['Cliente',(ticketVenta as any).cliente_nombre||'—'],['Cantidad',(ticketVenta as any).cantidad],['Precio unit.',formatGs((ticketVenta as any).precio_unitario)],['Método',(ticketVenta as any).metodo_pago]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:12}}><span style={{color:'#666'}}>{k}</span><span style={{fontWeight:500}}>{v}</span></div>
              ))}
              {(ticketVenta as any).descuento_gs>0&&<div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:12,color:'#FF4B6E'}}><span>Descuento</span><span>-{formatGs((ticketVenta as any).descuento_gs)}</span></div>}
              {(ticketVenta as any).metodo_pago==='Cuotas'&&<div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:12,color:'#FFD600'}}><span>Saldo pendiente</span><span>{formatGs((ticketVenta as any).saldo_pendiente||0)}</span></div>}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><span style={{fontSize:14,fontWeight:600}}>TOTAL</span><span style={{fontSize:22,fontWeight:700,color:'#1A3AFF'}}>{formatGs((ticketVenta as any).total)}</span></div>
            <div style={{textAlign:'center',fontSize:12,color:'#333',marginBottom:6,fontWeight:600}}>¡Gracias por tu compra! Te esperamos siempre 😊</div>
            <div style={{textAlign:'center',fontSize:10,color:'#888',marginBottom:10,lineHeight:1.5}}>Los productos pueden cambiarse hasta 48 hs después de la compra, debiendo presentar este comprobante. El producto y su envoltorio deben estar en perfecto estado.</div>
            <div style={{textAlign:'center',borderTop:'1px solid #eee',paddingTop:10,fontSize:10,color:'#888',marginBottom:14}}>
              📞 {CONTACTO.tel} · 📱 @{CONTACTO.instagram}<br/>Facebook: {CONTACTO.facebook} · TikTok: @{CONTACTO.tiktok}
            </div>
            <div className="no-print" style={{display:'flex',gap:10}}>
              <button style={{...s.btnYellow,flex:1,justifyContent:'center'}} onClick={()=>window.print()}>🖨 Imprimir</button>
              <button style={{...s.btnBlue,flex:1,justifyContent:'center'}} onClick={()=>setTicketVenta(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ORDEN DE REPARACIÓN */}
      {ticketRep&&(
        <div style={s.overlay} onClick={()=>setTicketRep(null)}>
          <div className="print-area" style={{background:'#fff',borderRadius:16,padding:24,width:'100%',maxWidth:380,color:'#111',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',borderBottom:'2px solid #1A3AFF',paddingBottom:12,marginBottom:12}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,#1A3AFF,#5BC4F5)',borderRadius:50,padding:'5px 14px 5px 8px',marginBottom:6}}>
                <div style={{width:22,height:22,background:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:11,color:'#1A3AFF'}}>N</div>
                <span style={{fontWeight:700,fontSize:12,color:'#fff'}}>NERY CELL</span>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:'#111',marginTop:4}}>ORDEN DE REPARACIÓN</div>
              <div style={{fontSize:10,color:'#888'}}>Quiindy, Paraguarí · {CONTACTO.tel}</div>
            </div>
            <div style={{fontSize:11,color:'#888',marginBottom:10,textAlign:'center'}}>Fecha ingreso: {formatFecha((ticketRep as any).fecha_ingreso||(ticketRep as any).created_at)}</div>
            <div style={{background:'#F0F4FF',borderRadius:10,padding:10,marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:'#1A3AFF',marginBottom:6,textTransform:'uppercase'}}>Datos del cliente</div>
              {[['Nombre',(ticketRep as any).cliente_nombre],['Teléfono',(ticketRep as any).cliente_telefono],(ticketRep as any).cliente_direccion?['Dirección',(ticketRep as any).cliente_direccion]:null].filter(Boolean).map(([k,v]:any)=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'3px 0'}}><span style={{color:'#666'}}>{k}</span><span style={{fontWeight:500}}>{v}</span></div>
              ))}
            </div>
            <div style={{background:'#F0F4FF',borderRadius:10,padding:10,marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:'#1A3AFF',marginBottom:6,textTransform:'uppercase'}}>Datos del equipo</div>
              {[['Modelo',(ticketRep as any).modelo_celular],['Problema',(ticketRep as any).problema_reportado],['Técnico',(ticketRep as any).tecnico]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'3px 0'}}><span style={{color:'#666'}}>{k}</span><span style={{fontWeight:500,textAlign:'right',maxWidth:'60%'}}>{v}</span></div>
              ))}
              {(ticketRep as any).observaciones&&<div style={{fontSize:12,padding:'6px 0',borderTop:'1px dashed #ddd',marginTop:4}}><span style={{color:'#666'}}>Obs: </span><span>{(ticketRep as any).observaciones}</span></div>}
            </div>
            <div style={{background:'#FFF8E0',borderRadius:10,padding:10,marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:'#B8860B',marginBottom:6,textTransform:'uppercase'}}>Costo y garantía</div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,fontWeight:600,marginBottom:6}}><span>Costo estimado</span><span style={{color:'#1A3AFF'}}>{(ticketRep as any).costo_estimado?formatGs((ticketRep as any).costo_estimado):'A confirmar'}</span></div>
              <div style={{fontSize:11,color:'#666',padding:'6px 0',borderTop:'1px dashed #ddd'}}><strong>Garantía:</strong> {(ticketRep as any).garantia||'Sin garantía'}</div>
              {((ticketRep as any).garantia?.includes('sin garantía')||(ticketRep as any).garantia?.includes('económico'))&&(
                <div style={{fontSize:10,color:'#FF6B35',marginTop:4,fontStyle:'italic'}}>⚠️ Display de línea económica. No incluye garantía de fábrica.</div>
              )}
            </div>
            <div style={{textAlign:'center',fontSize:10,color:'#888',marginBottom:14,lineHeight:1.6,borderTop:'1px dashed #ddd',paddingTop:8}}>
              Al retirar el equipo, el cliente acepta las condiciones del servicio.<br/>El equipo debe retirarse dentro de los 30 días.<br/>
              📞 {CONTACTO.tel} · @{CONTACTO.instagram}
            </div>
            <div className="no-print" style={{display:'flex',gap:10}}>
              <button style={{...s.btnYellow,flex:1,justifyContent:'center'}} onClick={()=>window.print()}>🖨 Imprimir</button>
              <button style={{...s.btnBlue,flex:1,justifyContent:'center'}} onClick={()=>setTicketRep(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}