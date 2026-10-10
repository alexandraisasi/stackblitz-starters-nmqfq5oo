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
  const [productos, setProductos] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [reparaciones, setReparaciones] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [gastos, setGastos] = useState<any[]>([])
  const [cajaRegistros, setCajaRegistros] = useState<any[]>([])
  const [pagosCuotas, setPagosCuotas] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [tipoModal, setTipoModal] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [busquedaVenta, setBusquedaVenta] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas')
  const [categoriaFiltroVenta, setCategoriaFiltroVenta] = useState('Todas')
  const [ticketVenta, setTicketVenta] = useState<any>(null)
  const [ticketRep, setTicketRep] = useState<any>(null)
  const [fotoPreview, setFotoPreview] = useState('')
  const [mesBalance, setMesBalance] = useState(new Date().getMonth())
  const [anioBalance, setAnioBalance] = useState(new Date().getFullYear())
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [editandoCategoria, setEditandoCategoria] = useState<any>(null)
  const [nombreCatEdit, setNombreCatEdit] = useState('')
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null)
  const [productoEditando, setProductoEditando] = useState<any>(null)
  const [horaActual, setHoraActual] = useState(new Date())
  const [montoRecibido, setMontoRecibido] = useState('')
  const [editandoDeuda, setEditandoDeuda] = useState<any>(null)
  // Carrito
  const [carrito, setCarrito] = useState<any[]>([])
  const [carritoCliente, setCarritoCliente] = useState('')
  const [carritoMetodo, setCarritoMetodo] = useState('Efectivo')
  const [carritoCuotas, setCarritoCuotas] = useState('2')
  const [carritoDescTipo, setCarritoDescTipo] = useState('ninguno')
  const [carritoDescValor, setCarritoDescValor] = useState('')
  const [carritoMontoRecibido, setCarritoMontoRecibido] = useState('')
  const fileRef = useRef<any>(null)
  const manualNombreRef = useRef<any>(null)
  const manualPrecioRef = useRef<any>(null)
  const manualCantRef = useRef<any>(null)

  const [formProducto, setFormProducto] = useState({ nombre:'', precio_compra:'', precio_venta:'', stock_actual:'', imei:'', categoria:'General', foto_url:'' })
  const [formReparacion, setFormReparacion] = useState({ cliente_nombre:'', cliente_telefono:'', cliente_direccion:'', modelo_celular:'', problema_reportado:'', tecnico:'Marcos', costo_estimado:'', garantia:'Sin garantía', observaciones:'' })
  const [formCliente, setFormCliente] = useState({ nombre:'', apellido:'', telefono:'', whatsapp:'', ciudad:'Quiindy' })
  const [formGasto, setFormGasto] = useState({ descripcion:'', categoria:'General', tipo:'Gasto', monto:'', fecha: new Date().toISOString().split('T')[0] })
  const [formPago, setFormPago] = useState({ monto:'', empleado:'Nery', observaciones:'' })
  const [formCaja, setFormCaja] = useState({ tipo:'apertura', empleado:'Nery', monto_inicial:'', observaciones:'' })
  const [formEditDeuda, setFormEditDeuda] = useState({ cliente_nombre:'', nombre_producto:'', saldo_pendiente:'', estado_pago:'Pendiente' })

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

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setHoraActual(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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

  // ── CARRITO ─────────────────────────────────────────────
  function agregarAlCarrito(p: any) {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === p.id)
      if (existe) return prev.map(i => i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { ...p, cantidad: 1 }]
    })
  }
  function cambiarCantidadCarrito(id: string, cantidad: number) {
    if (cantidad <= 0) { quitarDelCarrito(id); return }
    setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad } : i))
  }
  function quitarDelCarrito(id: string) { setCarrito(prev => prev.filter(i => i.id !== id)) }
  function limpiarCarrito() {
    setCarrito([]); setCarritoCliente(''); setCarritoMetodo('Efectivo')
    setCarritoCuotas('2'); setCarritoDescTipo('ninguno'); setCarritoDescValor('')
    setCarritoMontoRecibido('')
  }
  function calcularCarritoSubtotal() { return carrito.reduce((s, i) => s + i.precio_venta * i.cantidad, 0) }
  function calcularCarritoDescuento() {
    const sub = calcularCarritoSubtotal()
    if (carritoDescTipo === 'guaranies') return Number(carritoDescValor || 0)
    if (carritoDescTipo === 'porcentaje') return sub * Number(carritoDescValor || 0) / 100
    return 0
  }
  function calcularCarritoTotal() { return Math.max(0, calcularCarritoSubtotal() - calcularCarritoDescuento()) }
  function calcularVuelto() {
    const recibido = Number(carritoMontoRecibido || 0)
    const total = calcularCarritoTotal()
    return recibido > total ? recibido - total : 0
  }

  async function confirmarVentaCarrito() {
    if (carrito.length === 0) { alert('El carrito está vacío'); return }
    const total = calcularCarritoTotal()
    const descGs = calcularCarritoDescuento()
    const cuotas = Number(carritoCuotas)
    const esCuota = carritoMetodo === 'Cuotas' && cuotas > 1
    const montoCuota = esCuota ? Math.ceil(total / cuotas) : total
    const nombreProductos = carrito.map(i => `${i.nombre} x${i.cantidad}`).join(', ')
    const vuelto = calcularVuelto()
    const recibido = Number(carritoMontoRecibido || 0)

    const { data, error } = await supabase.from('ventas').insert({
      cliente_nombre: carritoCliente || null,
      nombre_producto: nombreProductos,
      precio_unitario: total,
      cantidad: carrito.reduce((s, i) => s + i.cantidad, 0),
      descuento_gs: descGs, total,
      metodo_pago: carritoMetodo, sucursal: 'Quiindy',
      cuotas_total: cuotas, cuota_actual: esCuota ? 0 : cuotas,
      monto_cuota: montoCuota, estado_pago: esCuota ? 'Pendiente' : 'Pagado',
      saldo_pendiente: esCuota ? total : 0,
      monto_recibido: recibido, vuelto,
    }).select().single()

    if (error) { alert('Error al registrar: ' + error.message); return }

       // Descontar stock directamente en Supabase usando RPC para evitar condiciones de carrera
       for (const item of carrito) {
        if (!item.id.toString().startsWith('manual-')) {
          const { data: prodActual } = await supabase
            .from('productos')
            .select('stock_actual')
            .eq('id', item.id)
            .single()
          if (prodActual) {
            const nuevoStock = Math.max(0, (prodActual.stock_actual || 0) - item.cantidad)
            await supabase
              .from('productos')
              .update({ stock_actual: nuevoStock })
              .eq('id', item.id)
          }
        }
      }

    if (data) setTicketVenta({ ...data, items: carrito, cajero: cajaAbierta ? (cajaAbierta as any).empleado : null })
    limpiarCarrito(); cargarTodo()
  }

  // ── CATEGORÍAS ──────────────────────────────────────────
  async function agregarCategoria() {
    if (!nuevaCategoria.trim()) return
    await supabase.from('mis_categorias').insert({ nombre: nuevaCategoria.trim() })
    setNuevaCategoria(''); cargarTodo()
  }
  async function eliminarCategoria(id: string) {
    if (!confirm('¿Eliminar esta categoría?')) return
    await supabase.from('mis_categorias').delete().eq('id', id); cargarTodo()
  }
  async function guardarEditCategoria(id: string) {
    if (!nombreCatEdit.trim()) return
    const catVieja = categorias.find(c => c.id === id)
    await supabase.from('mis_categorias').update({ nombre: nombreCatEdit.trim() }).eq('id', id)
    if (catVieja) await supabase.from('productos').update({ categoria: nombreCatEdit.trim() }).eq('categoria', catVieja.nombre)
    setEditandoCategoria(null); setNombreCatEdit(''); cargarTodo()
  }
  async function moverProductoCategoria(productoId: string, nuevaCat: string) {
    await supabase.from('productos').update({ categoria: nuevaCat }).eq('id', productoId); cargarTodo()
  }

  // ── PRODUCTOS ────────────────────────────────────────────
  async function guardarProducto() {
    const datos = {
      nombre: formProducto.nombre, precio_compra: Number(formProducto.precio_compra),
      precio_venta: Number(formProducto.precio_venta), stock_actual: Number(formProducto.stock_actual),
      imei: formProducto.imei || null, sucursal: 'Quiindy',
      categoria: formProducto.categoria, foto_url: formProducto.foto_url || null,
    }
    if (productoEditando) { await supabase.from('productos').update(datos).eq('id', productoEditando.id) }
    else { await supabase.from('productos').insert({ ...datos, activo: true }) }
    setShowModal(false); setProductoEditando(null)
    setFormProducto({ nombre:'', precio_compra:'', precio_venta:'', stock_actual:'', imei:'', categoria:'General', foto_url:'' })
    setFotoPreview(''); cargarTodo()
  }
  function abrirEditar(p: any) {
    setProductoEditando(p)
    setFormProducto({ nombre:p.nombre, precio_compra:String(p.precio_compra), precio_venta:String(p.precio_venta), stock_actual:String(p.stock_actual), imei:p.imei||'', categoria:p.categoria||'General', foto_url:p.foto_url||'' })
    setFotoPreview(p.foto_url||''); setTipoModal('producto'); setShowModal(true)
  }

  async function eliminarProducto(id: string) { if (!confirm('¿Eliminar?')) return; await supabase.from('productos').update({ activo: false }).eq('id', id); cargarTodo() }
  async function eliminarVenta(id: string) { if (!confirm('¿Eliminar?')) return; await supabase.from('ventas').delete().eq('id', id); cargarTodo() }
  async function eliminarReparacion(id: string) { if (!confirm('¿Eliminar?')) return; await supabase.from('reparaciones').delete().eq('id', id); cargarTodo() }
  async function eliminarCliente(id: string) { if (!confirm('¿Eliminar?')) return; await supabase.from('clientes').delete().eq('id', id); cargarTodo() }
  async function eliminarGasto(id: string) { if (!confirm('¿Eliminar?')) return; await supabase.from('gastos').delete().eq('id', id); cargarTodo() }

  async function eliminarDeuda(id: string) {
    if (!confirm('¿Eliminar esta deuda? Se borrará la venta completa.')) return
    await supabase.from('pagos_cuotas').delete().eq('venta_id', id)
    await supabase.from('ventas').delete().eq('id', id)
    cargarTodo()
  }
  async function guardarEditDeuda() {
    if (!editandoDeuda) return
    await supabase.from('ventas').update({
      cliente_nombre: formEditDeuda.cliente_nombre,
      nombre_producto: formEditDeuda.nombre_producto,
      saldo_pendiente: Number(formEditDeuda.saldo_pendiente),
      estado_pago: Number(formEditDeuda.saldo_pendiente) <= 0 ? 'Pagado' : formEditDeuda.estado_pago,
    }).eq('id', editandoDeuda.id)
    setEditandoDeuda(null); setShowModal(false); cargarTodo()
  }

  async function registrarPagoParcial() {
    const monto = Number(formPago.monto)
    if (!monto || monto <= 0) { alert('Ingresá un monto válido'); return }
    const v = ventaSeleccionada
    const nuevoSaldo = Math.max(0, (v.saldo_pendiente || v.total) - monto)
    await supabase.from('pagos_cuotas').insert({
      venta_id: v.id, monto, empleado: formPago.empleado,
      observaciones: formPago.observaciones || null, fecha: new Date().toISOString().split('T')[0],
    })
    await supabase.from('ventas').update({
      saldo_pendiente: nuevoSaldo, estado_pago: nuevoSaldo <= 0 ? 'Pagado' : 'Pendiente',
    }).eq('id', v.id)
    setShowModal(false); setFormPago({ monto:'', empleado:'Nery', observaciones:'' })
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
    await supabase.from('gastos').insert({
      descripcion: formGasto.descripcion, categoria: formGasto.categoria,
      tipo: formGasto.tipo, monto: Number(formGasto.monto), fecha: formGasto.fecha,
    })
    setShowModal(false)
    setFormGasto({ descripcion:'', categoria:'General', tipo:'Gasto', monto:'', fecha: new Date().toISOString().split('T')[0] })
    cargarTodo()
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

  async function cambiarEstadoRep(id: string, estado: string) {
    await supabase.from('reparaciones').update({ estado }).eq('id', id); cargarTodo()
  }

  function handleFoto(e: any) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev: any) => { const url = ev.target.result as string; setFotoPreview(url); setFormProducto(f => ({ ...f, foto_url: url })) }
    reader.readAsDataURL(file)
  }

  function formatGs(n: any) { return `Gs. ${Number(n || 0).toLocaleString('es-PY')}` }
  function formatFecha(d: any) { return d ? new Date(d).toLocaleDateString('es-PY') : '—' }
  function formatHora(d: any) { return d ? new Date(d).toLocaleTimeString('es-PY', { hour:'2-digit', minute:'2-digit' }) : '—' }

  function estadoColor(e: string) {
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

  const repsEntregadasHoy = reparaciones.filter(r => r.estado==='Entregado' && new Date(r.updated_at||r.fecha_ingreso) >= hoy)
  const repsEntregadasMes = reparaciones.filter(r => { const d = new Date(r.updated_at||r.fecha_ingreso); return r.estado==='Entregado' && d >= inicioMes })
  const repsEntregadasBalance = reparaciones.filter(r => { const d = new Date(r.updated_at||r.fecha_ingreso); return r.estado==='Entregado' && d.getMonth()===mesBalance && d.getFullYear()===anioBalance })
  const ingresoRepsHoy = repsEntregadasHoy.reduce((s: number, r: any) => s+(r.costo_estimado||0), 0)
  const ingresoRepsMes = repsEntregadasMes.reduce((s: number, r: any) => s+(r.costo_estimado||0), 0)
  const ingresoRepsBalance = repsEntregadasBalance.reduce((s: number, r: any) => s+(r.costo_estimado||0), 0)

  const ventasHoy = ventas.filter(v => new Date(v.created_at) >= hoy)
  const ventasMes = ventas.filter(v => new Date(v.created_at) >= inicioMes)
  const gastosMes = gastos.filter(g => { const d = new Date(g.fecha); return d.getMonth()===ahora.getMonth() && d.getFullYear()===ahora.getFullYear() })
  const gastosHoy = gastos.filter(g => { const d = new Date(g.fecha); const h = new Date(); h.setHours(0,0,0,0); return d >= h })
  const gastosMesReales = gastosMes.filter(g => g.tipo !== 'Inversión')
  const inversionesMes = gastosMes.filter(g => g.tipo === 'Inversión')
  const totalGastosHoy = gastosHoy.filter(g => g.tipo !== 'Inversión').reduce((s: number, g: any) => s+(g.monto||0), 0)

  const cobradoHoy = ventasHoy.reduce((s: number, v: any) => s+((v.total||0)-(v.saldo_pendiente||0)), 0)
  const cobradoMes = ventasMes.reduce((s: number, v: any) => s+((v.total||0)-(v.saldo_pendiente||0)), 0)
  const pagosHoy = pagosCuotas.filter((p: any) => { const d = new Date(p.created_at); return d >= hoy })
  const ingresoPagosHoy = pagosHoy.reduce((s: number, p: any) => s+(p.monto||0), 0)

  const ingresosBrutoHoy = cobradoHoy + ingresoRepsHoy + ingresoPagosHoy
  const balanceHoy = ingresosBrutoHoy - totalGastosHoy  // ← gastos restan de caja del día
  const balanceMes = cobradoMes + ingresoRepsMes
  const totalGastosMes = gastosMesReales.reduce((s: number, g: any) => s+(g.monto||0), 0)
  const totalInversionesMes = inversionesMes.reduce((s: number, g: any) => s+(g.monto||0), 0)
  const gananciaNeta = balanceMes - totalGastosMes

  const efectivoMes = ventasMes.filter((v: any) => v.metodo_pago==='Efectivo').reduce((s: number, v: any) => s+(v.total||0), 0)
  const transferenciaMes = ventasMes.filter((v: any) => v.metodo_pago==='Transferencia').reduce((s: number, v: any) => s+(v.total||0), 0)
  const repPendientes = reparaciones.filter(r => !['Entregado','Cancelado'].includes(r.estado))
  const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo)
  const ventasConDeuda = ventas.filter(v => v.estado_pago === 'Pendiente')
  const totalDeuda = ventasConDeuda.reduce((s: number, v: any) => s+(v.saldo_pendiente||0), 0)
  const mesActual = ahora.toLocaleDateString('es-PY', { month:'long', year:'numeric' })

  // Caja
  const cajaHoy = cajaRegistros.filter(c => { const d = new Date(c.created_at); return d >= hoy })
  const cajaAbierta = cajaHoy.find((c: any) => c.tipo==='apertura')
  const cajaCerrada = cajaHoy.find((c: any) => c.tipo==='cierre')
  const estadoCaja = cajaAbierta && !cajaCerrada ? 'abierta' : cajaCerrada ? 'cerrada' : 'sin abrir'
  const cajeroActual = cajaAbierta ? (cajaAbierta as any).empleado : null

  const ventasBalance = ventas.filter(v => { const d = new Date(v.created_at); return d.getMonth()===mesBalance && d.getFullYear()===anioBalance })
  const gastosBalance = gastos.filter(g => { const d = new Date(g.fecha); return d.getMonth()===mesBalance && d.getFullYear()===anioBalance })
  const gastosBalanceReales = gastosBalance.filter(g => g.tipo !== 'Inversión')
  const inversionesBalance = gastosBalance.filter(g => g.tipo === 'Inversión')
  const totalVentasBalance = ventasBalance.reduce((s: number, v: any) => s+((v.total||0)-(v.saldo_pendiente||0)), 0) + ingresoRepsBalance
  const totalGastosBalance = gastosBalanceReales.reduce((s: number, g: any) => s+(g.monto||0), 0)
  const totalInversionesBalance = inversionesBalance.reduce((s: number, g: any) => s+(g.monto||0), 0)
  const gananciaNetaBalance = totalVentasBalance - totalGastosBalance
  const efectivoBalance = ventasBalance.filter((v: any) => v.metodo_pago==='Efectivo').reduce((s: number, v: any) => s+(v.total||0), 0)
  const transferenciaBalance = ventasBalance.filter((v: any) => v.metodo_pago==='Transferencia').reduce((s: number, v: any) => s+(v.total||0), 0)
  const cuotasBalance = ventasBalance.filter((v: any) => v.metodo_pago==='Cuotas').reduce((s: number, v: any) => s+(v.total||0), 0)

  // Más vendidos: cuenta apariciones por nombre de producto en ventas + reparaciones entregadas
  const conteoMes: any = {}
  ventasMes.forEach((v: any) => {
    const key = v.nombre_producto || 'Sin nombre'
    conteoMes[key] = (conteoMes[key] || 0) + (v.cantidad || 1)
  })
  repsEntregadasMes.forEach((r: any) => {
    const key = `Reparación: ${r.modelo_celular}`
    conteoMes[key] = (conteoMes[key] || 0) + 1
  })
  const masVendidos = Object.entries(conteoMes).sort((a: any, b: any) => b[1]-a[1]).slice(0,5)

  const listaCategorias = ['Todas', ...categorias.map((cat: any) => cat.nombre)]
  const productosFiltradosVenta = productos.filter(p => {
    const matchB = p.nombre.toLowerCase().includes(busquedaVenta.toLowerCase())
    const matchC = categoriaFiltroVenta==='Todas' || p.categoria===categoriaFiltroVenta
    return matchB && matchC
  })
  const productosFiltrados = productos.filter(p => {
    const matchB = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.imei && p.imei.includes(busqueda))
    const matchC = categoriaFiltro==='Todas' || p.categoria===categoriaFiltro
    return matchB && matchC
  })
  const productosAgrupados = categorias.reduce((acc: any, cat: any) => {
    const prods = productos.filter(p => p.categoria===cat.nombre)
    if (prods.length > 0) acc[cat.nombre] = prods
    return acc
  }, {} as any)

  const carritoSubtotal = calcularCarritoSubtotal()
  const carritoDescuento = calcularCarritoDescuento()
  const carritoTotal = calcularCarritoTotal()
  const carritoVuelto = calcularVuelto()

  const s = {
    app: { display:'flex', height:'100vh', overflow:'hidden', background:c.bg, fontFamily:'sans-serif', transition:'background .2s' },
    sidebar: { width:210, minWidth:210, height:'100vh', background:c.sidebar, borderRight:`1px solid ${c.border}`, display:'flex', flexDirection:'column' as const, flexShrink:0 },
    main: { flex:1, display:'flex', flexDirection:'column' as const, minWidth:0, height:'100vh', overflow:'hidden' },
    topbar: { height:56, minHeight:56, background:c.topbar, borderBottom:`1px solid ${c.border}`, display:'flex', alignItems:'center', padding:'0 24px', gap:12, flexShrink:0 },
    content: { flex:1, padding:'20px 24px', overflowY:'auto' as const },
    card: { background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:18, marginBottom:14 },
    grid4: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 },
    grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 },
    input: { width:'100%', background:c.input, border:`1px solid ${c.inputBorder}`, borderRadius:10, padding:'9px 12px', color:c.text, fontSize:13, fontFamily:'sans-serif', outline:'none', marginBottom:10, boxSizing:'border-box' as const },
    btnYellow: { background:'#FFD600', color:'#0D0D0D', border:'none', borderRadius:50, padding:'8px 18px', fontSize:13, fontWeight:600 as const, cursor:'pointer' },
    btnRed: { background:'rgba(255,75,110,0.15)', color:'#FF4B6E', border:'1px solid rgba(255,75,110,0.3)', borderRadius:50, padding:'5px 10px', fontSize:11, cursor:'pointer' },
    btnBlue: { background:'rgba(26,58,255,0.1)', color:'#6B8AFF', border:'1px solid rgba(26,58,255,0.3)', borderRadius:50, padding:'5px 10px', fontSize:11, cursor:'pointer' },
    btnGreen: { background:'rgba(0,217,126,0.15)', color:'#00D97E', border:'1px solid rgba(0,217,126,0.3)', borderRadius:50, padding:'5px 10px', fontSize:11, cursor:'pointer' },
    btnGray: { background:'rgba(255,255,255,0.06)', color:'#7A8BAA', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, padding:'5px 10px', fontSize:11, cursor:'pointer' },
    table: { width:'100%', borderCollapse:'collapse' as const },
    th: { textAlign:'left' as const, fontSize:11, color:c.muted, textTransform:'uppercase' as const, letterSpacing:'.6px', padding:'8px 10px', borderBottom:`1px solid ${c.border}` },
    td: { padding:'10px', fontSize:13, color:c.text, borderBottom:`1px solid ${c.border}` },
    overlay: { position:'fixed' as const, inset:0, background:c.overlay, display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 },
    modal: { background:c.modal, border:`1px solid ${c.border}`, borderRadius:20, padding:24, width:'100%', maxWidth:460, maxHeight:'90vh', overflowY:'auto' as const },
  }

  const printStyle = `
    @media print {
      body * { visibility: hidden !important; }
      .print-area, .print-area * { visibility: visible !important; }
      .print-area { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; z-index: 9999 !important; background: white !important; }
      .no-print { display: none !important; }
      @page { margin: 4mm; size: 80mm auto; }
    }
  `

  function NavItem({ id, label, emoji, badge, badgeColor='red' }: any) {
    const active = seccion===id
    return (
      <div onClick={() => { setSeccion(id); setBusqueda(''); setCategoriaFiltro('Todas') }}
        style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:10, cursor:'pointer', color:active?'#6B8AFF':c.muted, background:active?'rgba(26,58,255,0.15)':'transparent', fontSize:13, fontWeight:active?500:400, marginBottom:2 }}>
        <span>{emoji}</span><span style={{ flex:1 }}>{label}</span>
        {badge > 0 && <span style={{ background:badgeColor==='yellow'?'#FFD600':'#FF4B6E', color:badgeColor==='yellow'?'#000':'#fff', fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:50 }}>{badge}</span>}
      </div>
    )
  }

  function StatCard({ label, value, color, emoji, sub=null }: any) {
    return (
      <div style={{ ...s.card, marginBottom:0 }}>
        <div style={{ fontSize:20, marginBottom:8 }}>{emoji}</div>
        <div style={{ fontSize:11, color:c.muted, textTransform:'uppercase', letterSpacing:'.6px', marginBottom:4 }}>{label}</div>
        <div style={{ fontSize:20, fontWeight:700, color }}>{value}</div>
        {sub && <div style={{ fontSize:11, color:c.muted, marginTop:4 }}>{sub}</div>}
      </div>
    )
  }

  function Label({ text }: any) {
    return <div style={{ fontSize:11, color:c.muted, textTransform:'uppercase', letterSpacing:'.6px', marginBottom:6 }}>{text}</div>
  }

  function ProductoCardStock({ p }: any) {
    return (
      <div style={{ background:c.card2, border:`1px solid ${c.border}`, borderRadius:12, padding:12 }}>
        <div style={{ width:'100%', height:90, background:c.card, borderRadius:8, marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
          {p.foto_url ? <img src={p.foto_url} alt={p.nombre} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} /> : <span style={{ fontSize:28, opacity:.3 }}>📱</span>}
        </div>
        <div style={{ fontWeight:600, fontSize:12, color:c.text, marginBottom:4 }}>{p.nombre}</div>
        <div style={{ fontSize:11, color:'#00D97E', marginBottom:6 }}>{formatGs(p.precio_venta)}</div>
        <div style={{ fontSize:10, color:p.stock_actual<=p.stock_minimo?'#FF4B6E':c.muted, marginBottom:6 }}>Stock: {p.stock_actual}</div>
        <div style={{ display:'flex', gap:4 }}>
          <button style={{ ...s.btnBlue, padding:'4px 8px', fontSize:11 }} onClick={() => abrirEditar(p)}>✏️</button>
          <button style={{ ...s.btnRed, padding:'4px 8px' }} onClick={() => eliminarProducto(p.id)}>🗑</button>
        </div>
      </div>
    )
  }

  function ProductoCardVenta({ p }: any) {
    const enCarrito = carrito.find(i => i.id === p.id)
    return (
      <div onClick={() => agregarAlCarrito(p)}
        style={{ background:enCarrito?'rgba(26,58,255,0.12)':c.card2, border:`2px solid ${enCarrito?'#1A3AFF':c.border}`, borderRadius:12, padding:10, cursor:'pointer', transition:'all .15s', position:'relative' as const }}>
        {enCarrito && (
          <div style={{ position:'absolute', top:6, right:6, background:'#1A3AFF', color:'#fff', borderRadius:50, width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>
            {enCarrito.cantidad}
          </div>
        )}
        <div style={{ width:'100%', height:80, background:c.card, borderRadius:8, marginBottom:6, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
          {p.foto_url ? <img src={p.foto_url} alt={p.nombre} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} /> : <span style={{ fontSize:24, opacity:.3 }}>📱</span>}
        </div>
        <div style={{ fontWeight:600, fontSize:11, color:c.text, marginBottom:2 }}>{p.nombre}</div>
        <div style={{ fontSize:12, color:'#00D97E', fontWeight:700 }}>{formatGs(p.precio_venta)}</div>
        <div style={{ fontSize:10, color:p.stock_actual<=0?'#FF4B6E':c.muted }}>Stock: {p.stock_actual}</div>
      </div>
    )
  }

  function PaginaBalance() {
    return (
      <div style={{ background:'#fff', color:'#111', padding:'40px', maxWidth:794, margin:'0 auto', fontFamily:'Arial,sans-serif' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'3px solid #1A3AFF', paddingBottom:16, marginBottom:20 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:700, color:'#1A3AFF' }}>NERY CELL</div>
            <div style={{ fontSize:11, color:'#666' }}>Tecnología · Accesorios · Reparaciones</div>
            <div style={{ fontSize:11, color:'#666' }}>Quiindy, Paraguarí · {CONTACTO.tel}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:16, fontWeight:700 }}>BALANCE MENSUAL</div>
            <div style={{ fontSize:14, color:'#1A3AFF', fontWeight:600 }}>{MESES[mesBalance]} {anioBalance}</div>
            <div style={{ fontSize:11, color:'#666' }}>Generado: {new Date().toLocaleDateString('es-PY')}</div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
          {[
            { label:'Total ingresos', value:formatGs(totalVentasBalance), color:'#1A3AFF' },
            { label:'Gastos operativos', value:formatGs(totalGastosBalance), color:'#FF4B6E' },
            { label:'Ganancia neta', value:formatGs(gananciaNetaBalance), color:gananciaNetaBalance>=0?'#00A86B':'#FF4B6E' },
          ].map(item => (
            <div key={item.label} style={{ border:'2px solid #eee', borderRadius:10, padding:14, textAlign:'center' }}>
              <div style={{ fontSize:10, color:'#888', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:18, fontWeight:700, color:item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        {totalInversionesBalance > 0 && (
          <div style={{ background:'#FFF8E0', border:'1px solid #FFD600', borderRadius:10, padding:'10px 14px', marginBottom:16, display:'flex', justifyContent:'space-between' }}>
            <div><div style={{ fontSize:11, fontWeight:700, color:'#B8860B' }}>💼 Inversiones del mes</div><div style={{ fontSize:11, color:'#666' }}>No afectan la ganancia neta</div></div>
            <div style={{ fontSize:16, fontWeight:700, color:'#B8860B' }}>{formatGs(totalInversionesBalance)}</div>
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
          {[{label:'Efectivo',value:formatGs(efectivoBalance),color:'#00A86B'},{label:'Transferencia',value:formatGs(transferenciaBalance),color:'#0066CC'},{label:'Cuotas',value:formatGs(cuotasBalance),color:'#FF8C00'}].map(item => (
            <div key={item.label} style={{ background:'#F8FAFF', borderRadius:8, padding:10, textAlign:'center' }}>
              <div style={{ fontSize:10, color:'#888', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:3 }}>{item.label}</div>
              <div style={{ fontSize:14, fontWeight:700, color:item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:12, fontWeight:700, marginBottom:8, color:'#1A3AFF', textTransform:'uppercase' }}>Ventas ({ventasBalance.length})</div>
        <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:20 }}>
          <thead><tr style={{ background:'#1A3AFF' }}>{['Fecha','Producto','Cliente','Método','Estado','Total'].map(h => <th key={h} style={{ color:'#fff', fontSize:10, padding:'7px 8px', textAlign:'left', fontWeight:600 }}>{h}</th>)}</tr></thead>
          <tbody>
            {ventasBalance.length===0 && <tr><td colSpan={6} style={{ padding:16, textAlign:'center', color:'#888', fontSize:12 }}>Sin ventas</td></tr>}
            {ventasBalance.map((v: any, i: number) => (
              <tr key={v.id} style={{ background:i%2===0?'#F8FAFF':'#fff' }}>
                <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee' }}>{formatFecha(v.created_at)}</td>
                <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee', fontWeight:500 }}>{v.nombre_producto||'—'}</td>
                <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee' }}>{v.cliente_nombre||'—'}</td>
                <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee' }}>{v.metodo_pago}</td>
                <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee' }}><span style={{ background:v.estado_pago==='Pagado'?'#00A86B':'#FF8C00', color:'#fff', padding:'1px 6px', borderRadius:50, fontSize:9 }}>{v.estado_pago||'Pagado'}</span></td>
                <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee', fontWeight:600, color:'#1A3AFF' }}>{formatGs(v.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr style={{ background:'#1A3AFF' }}><td colSpan={5} style={{ padding:'7px 8px', color:'#fff', fontWeight:700, fontSize:12 }}>TOTAL INGRESOS</td><td style={{ padding:'7px 8px', color:'#FFD600', fontWeight:700, fontSize:14 }}>{formatGs(totalVentasBalance)}</td></tr></tfoot>
        </table>
        <div style={{ fontSize:12, fontWeight:700, marginBottom:8, color:'#FF4B6E', textTransform:'uppercase' }}>Gastos operativos ({gastosBalanceReales.length})</div>
        <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
          <thead><tr style={{ background:'#FF4B6E' }}>{['Fecha','Descripción','Categoría','Monto'].map(h => <th key={h} style={{ color:'#fff', fontSize:10, padding:'7px 8px', textAlign:'left', fontWeight:600 }}>{h}</th>)}</tr></thead>
          <tbody>
            {gastosBalanceReales.length===0 && <tr><td colSpan={4} style={{ padding:16, textAlign:'center', color:'#888', fontSize:12 }}>Sin gastos</td></tr>}
            {gastosBalanceReales.map((g: any, i: number) => (
              <tr key={g.id} style={{ background:i%2===0?'#FFF8F8':'#fff' }}>
                <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee' }}>{formatFecha(g.fecha)}</td>
                <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee', fontWeight:500 }}>{g.descripcion}</td>
                <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee' }}>{g.categoria}</td>
                <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee', fontWeight:600, color:'#FF4B6E' }}>{formatGs(g.monto)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr style={{ background:'#FF4B6E' }}><td colSpan={3} style={{ padding:'7px 8px', color:'#fff', fontWeight:700, fontSize:12 }}>TOTAL GASTOS</td><td style={{ padding:'7px 8px', color:'#fff', fontWeight:700, fontSize:14 }}>{formatGs(totalGastosBalance)}</td></tr></tfoot>
        </table>
        {inversionesBalance.length > 0 && (
          <>
            <div style={{ fontSize:12, fontWeight:700, marginBottom:8, color:'#B8860B', textTransform:'uppercase' }}>Inversiones ({inversionesBalance.length})</div>
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:20 }}>
              <thead><tr style={{ background:'#B8860B' }}>{['Fecha','Descripción','Categoría','Monto'].map(h => <th key={h} style={{ color:'#fff', fontSize:10, padding:'7px 8px', textAlign:'left', fontWeight:600 }}>{h}</th>)}</tr></thead>
              <tbody>
                {inversionesBalance.map((g: any, i: number) => (
                  <tr key={g.id} style={{ background:i%2===0?'#FFFDF0':'#fff' }}>
                    <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee' }}>{formatFecha(g.fecha)}</td>
                    <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee', fontWeight:500 }}>{g.descripcion}</td>
                    <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee' }}>{g.categoria}</td>
                    <td style={{ padding:'6px 8px', fontSize:11, borderBottom:'1px solid #eee', fontWeight:600, color:'#B8860B' }}>{formatGs(g.monto)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr style={{ background:'#B8860B' }}><td colSpan={3} style={{ padding:'7px 8px', color:'#fff', fontWeight:700, fontSize:12 }}>TOTAL INVERSIONES</td><td style={{ padding:'7px 8px', color:'#fff', fontWeight:700, fontSize:14 }}>{formatGs(totalInversionesBalance)}</td></tr></tfoot>
            </table>
          </>
        )}
        <div style={{ background:gananciaNetaBalance>=0?'#F0FFF8':'#FFF0F0', border:`2px solid ${gananciaNetaBalance>=0?'#00A86B':'#FF4B6E'}`, borderRadius:12, padding:16, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:4 }}>Ganancia neta del mes</div>
            <div style={{ fontSize:11, color:'#666' }}>Ingresos {formatGs(totalVentasBalance)} — Gastos {formatGs(totalGastosBalance)}</div>
            {totalInversionesBalance > 0 && <div style={{ fontSize:11, color:'#B8860B' }}>Inversiones: {formatGs(totalInversionesBalance)} (no afectan ganancia)</div>}
          </div>
          <div style={{ fontSize:28, fontWeight:700, color:gananciaNetaBalance>=0?'#00A86B':'#FF4B6E' }}>{formatGs(gananciaNetaBalance)}</div>
        </div>
        <div style={{ borderTop:'2px solid #1A3AFF', paddingTop:12, display:'flex', justifyContent:'space-between', fontSize:10, color:'#888' }}>
          <span>Nery Cell — Sistema de gestión interno</span>
          <span>📞 {CONTACTO.tel} · @{CONTACTO.instagram}</span>
        </div>
      </div>
    )
  }

  return (
    <div style={s.app}>
      <style>{printStyle}</style>

      {/* ALERTA CAJA NO ABIERTA */}
      {estadoCaja !== 'abierta' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:c.modal, border:`1px solid ${c.border}`, borderRadius:20, padding:32, maxWidth:400, width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>{estadoCaja==='cerrada'?'🔴':'🟡'}</div>
            <div style={{ fontSize:20, fontWeight:700, color:c.text, marginBottom:8 }}>
              {estadoCaja==='cerrada' ? 'La caja está cerrada' : 'La caja no fue abierta hoy'}
            </div>
            <div style={{ fontSize:13, color:c.muted, marginBottom:24 }}>
              Debés abrir la caja antes de usar el sistema.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              {EMPLEADOS.map(emp => (
                <button key={emp} style={{ ...s.btnYellow, justifyContent:'center', padding:'12px' }}
                  onClick={async () => {
                    await supabase.from('caja').insert({ tipo:'apertura', empleado:emp, monto_inicial:0, fecha: new Date().toISOString().split('T')[0] })
                    cargarTodo()
                  }}>
                  🟢 {emp} abre caja
                </button>
              ))}
            </div>
            <button style={{ ...s.btnGray, width:'100%', justifyContent:'center', padding:'10px' }}
              onClick={() => { setTipoModal('caja'); setShowModal(true) }}>
              Configurar apertura manual →
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={{ padding:'16px', borderBottom:`1px solid ${c.border}` }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#1A3AFF,#5BC4F5)', borderRadius:50, padding:'6px 14px 6px 8px' }}>
            <div style={{ width:28, height:28, background:'#fff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:'#1A3AFF' }}>N</div>
            <span style={{ fontWeight:700, fontSize:13, color:'#fff' }}>NERY CELL</span>
          </div>
          {/* Reloj en tiempo real */}
          <div style={{ marginTop:8, fontSize:11, color:c.muted }}>
            {horaActual.toLocaleDateString('es-PY', { weekday:'short', day:'numeric', month:'short' })}
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:c.text, letterSpacing:1 }}>
            {horaActual.toLocaleTimeString('es-PY', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
          </div>
          {cajeroActual && <div style={{ fontSize:11, color:'#00D97E', marginTop:2 }}>👤 Cajero: {cajeroActual}</div>}
        </div>
        <nav style={{ padding:'12px 10px', flex:1, overflowY:'auto' }}>
          <NavItem id="dashboard" label="Dashboard" emoji="⚡" />
          <NavItem id="ventas" label="Nueva venta" emoji="🛒" badge={carrito.length} badgeColor="yellow" />
          <NavItem id="historial" label="Historial ventas" emoji="💰" />
          <NavItem id="stock" label="Stock" emoji="📦" badge={stockBajo.length} />
          <NavItem id="cuotas" label="Cuotas / Deudas" emoji="📋" badge={ventasConDeuda.length} badgeColor="yellow" />
          <NavItem id="tecnico" label="Técnico" emoji="🔧" badge={repPendientes.length} />
          <NavItem id="clientes" label="Clientes" emoji="👥" />
          <NavItem id="gastos" label="Gastos / Inversiones" emoji="💸" />
          <NavItem id="caja" label="Caja" emoji="🏦" />
          <NavItem id="balance" label="Balance" emoji="📊" />
          <NavItem id="categorias" label="Categorías" emoji="📁" />
        </nav>
        <div style={{ padding:12, borderTop:`1px solid ${c.border}` }}>
          <div onClick={() => setModoOscuro(!modoOscuro)} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:c.input, borderRadius:10, cursor:'pointer', marginBottom:8, border:`1px solid ${c.border}` }}>
            <span>{modoOscuro?'☀️':'🌙'}</span><span style={{ fontSize:12, color:c.muted }}>{modoOscuro?'Modo claro':'Modo oscuro'}</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={s.main}>
        <header style={s.topbar}>
          <span style={{ fontWeight:700, fontSize:15, color:c.text }}>
            {seccion==='dashboard'&&'⚡ Dashboard'}{seccion==='ventas'&&'🛒 Nueva venta'}
            {seccion==='historial'&&'💰 Historial de ventas'}{seccion==='stock'&&'📦 Stock'}
            {seccion==='cuotas'&&'📋 Cuotas y Deudas'}{seccion==='tecnico'&&'🔧 Servicio Técnico'}
            {seccion==='clientes'&&'👥 Clientes'}{seccion==='gastos'&&'💸 Gastos e Inversiones'}
            {seccion==='caja'&&'🏦 Caja'}{seccion==='balance'&&'📊 Balance'}{seccion==='categorias'&&'📁 Categorías'}
          </span>
          <div style={{ marginLeft:'auto', display:'flex', gap:10, alignItems:'center' }}>
            {seccion==='stock' && <>
              <input style={{ ...s.input, marginBottom:0, maxWidth:200, padding:'7px 12px' }} placeholder="🔍 Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              <button style={s.btnYellow} onClick={() => { setProductoEditando(null); setFormProducto({ nombre:'', precio_compra:'', precio_venta:'', stock_actual:'', imei:'', categoria:'General', foto_url:'' }); setFotoPreview(''); setTipoModal('producto'); setShowModal(true) }}>+ Producto</button>
            </>}
            {seccion==='tecnico' && <button style={s.btnYellow} onClick={() => { setTipoModal('reparacion'); setShowModal(true) }}>+ Registrar equipo</button>}
            {seccion==='clientes' && <button style={s.btnYellow} onClick={() => { setTipoModal('cliente'); setShowModal(true) }}>+ Agregar cliente</button>}
            {seccion==='gastos' && <button style={s.btnYellow} onClick={() => { setTipoModal('gasto'); setShowModal(true) }}>+ Registrar</button>}
            {seccion==='caja' && <button style={s.btnYellow} onClick={() => { setTipoModal('caja'); setShowModal(true) }}>+ Abrir / Cerrar caja</button>}
            {seccion==='balance' && <button style={s.btnYellow} onClick={() => window.print()}>🖨 Imprimir balance</button>}
          </div>
        </header>

        <div style={s.content}>

          {/* DASHBOARD */}
          {seccion==='dashboard' && (
            <div>
              <div style={s.grid4}>
                <StatCard label="Caja del día" value={formatGs(balanceHoy)} color="#00D97E" emoji="💵" sub={totalGastosHoy>0?`-${formatGs(totalGastosHoy)} gastos`:undefined} />
                <StatCard label={`Ingresos ${mesActual}`} value={formatGs(balanceMes)} color="#5BC4F5" emoji="📆" />
                <StatCard label="Gastos operativos" value={formatGs(totalGastosMes)} color="#FF4B6E" emoji="💸" />
                <StatCard label="Ganancia neta" value={formatGs(gananciaNeta)} color={gananciaNeta>=0?'#00D97E':'#FF4B6E'} emoji="💎" sub={gananciaNeta>=0?'✅ Positivo':'⚠️ Negativo'} />
              </div>
              {totalInversionesMes > 0 && (
                <div style={{ background:'rgba(255,214,0,0.07)', border:'1px solid rgba(255,214,0,0.2)', borderRadius:12, padding:'10px 14px', marginBottom:14, display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:13, color:'#FFD600' }}>💼 Inversiones del mes (no afectan ganancia)</span>
                  <span style={{ fontWeight:700, color:'#FFD600' }}>{formatGs(totalInversionesMes)}</span>
                </div>
              )}
              <div style={s.grid2}>
                <div style={s.card}>
                  <div style={{ fontSize:13, fontWeight:600, color:c.text, marginBottom:4 }}>💰 Ingresos de hoy</div>
                  <div style={{ fontSize:11, color:c.muted, marginBottom:8 }}>
                    {ventasHoy.length} ventas · {repsEntregadasHoy.length} reparaciones
                    {totalGastosHoy > 0 && <span style={{ color:'#FF4B6E' }}> · -{formatGs(totalGastosHoy)} gastos</span>}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:700, color:'#00D97E', marginBottom:10, borderBottom:`1px solid ${c.border}`, paddingBottom:8 }}>
                    <span>Caja neta del día</span><span>{formatGs(balanceHoy)}</span>
                  </div>
                  {ventasHoy.length===0 && repsEntregadasHoy.length===0 && <p style={{ color:c.muted, fontSize:12 }}>Sin ingresos hoy todavía</p>}
                  {ventasHoy.map((v: any) => (
                    <div key={v.id} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${c.border}`, fontSize:12 }}>
                      <span style={{ color:c.text }}>🛍 {v.nombre_producto||v.cliente_nombre||'—'}</span>
                      <span style={{ color:'#00D97E', fontWeight:600 }}>{formatGs((v.total||0)-(v.saldo_pendiente||0))}</span>
                    </div>
                  ))}
                  {repsEntregadasHoy.map((r: any) => (
                    <div key={r.id} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${c.border}`, fontSize:12 }}>
                      <span style={{ color:c.text }}>🔧 {r.modelo_celular} — {r.cliente_nombre}</span>
                      <span style={{ color:'#00D97E', fontWeight:600 }}>{formatGs(r.costo_estimado||0)}</span>
                    </div>
                  ))}
                  {gastosHoy.filter(g => g.tipo!=='Inversión').map((g: any) => (
                    <div key={g.id} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${c.border}`, fontSize:12 }}>
                      <span style={{ color:'#FF4B6E' }}>💸 {g.descripcion}</span>
                      <span style={{ color:'#FF4B6E', fontWeight:600 }}>-{formatGs(g.monto)}</span>
                    </div>
                  ))}
                </div>
                <div style={s.card}>
                  <div style={{ fontSize:13, fontWeight:600, color:c.text, marginBottom:4 }}>📆 Resumen {mesActual}</div>
                  <div style={{ fontSize:28, fontWeight:700, color:gananciaNeta>=0?'#00D97E':'#FF4B6E', margin:'8px 0' }}>{formatGs(gananciaNeta)}</div>
                  <div style={{ fontSize:12, color:c.muted, marginBottom:3 }}>📈 Ingresos: {formatGs(balanceMes)}</div>
                  {ingresoRepsMes > 0 && <div style={{ fontSize:12, color:c.muted, marginBottom:3 }}>🔧 Reparaciones: {formatGs(ingresoRepsMes)}</div>}
                  <div style={{ fontSize:12, color:'#FF4B6E', marginBottom:3 }}>📉 Gastos: {formatGs(totalGastosMes)}</div>
                  {totalInversionesMes > 0 && <div style={{ fontSize:12, color:'#FFD600', marginBottom:3 }}>💼 Inversiones: {formatGs(totalInversionesMes)}</div>}
                  <div style={{ fontSize:12, color:c.muted, marginBottom:12 }}>💵 Efectivo: {formatGs(efectivoMes)}</div>
                  <button style={s.btnYellow} onClick={() => setSeccion('balance')}>Ver balance completo →</button>
                </div>
              </div>
              <div style={s.grid2}>
                <div style={s.card}>
                  <div style={{ fontSize:13, fontWeight:600, color:c.text, marginBottom:12 }}>🏆 Más vendidos / servicios del mes</div>
                  {masVendidos.length===0 && <p style={{ color:c.muted, fontSize:12 }}>Sin actividad este mes</p>}
                  {masVendidos.map(([nombre, cant]: any, i: number) => (
                    <div key={nombre} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:`1px solid ${c.border}` }}>
                      <span style={{ fontSize:16, width:24 }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':'➡️'}</span>
                      <span style={{ flex:1, fontSize:12, color:c.text }}>{nombre}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:'#FFD600' }}>{cant}x</span>
                    </div>
                  ))}
                </div>
                <div style={s.card}>
                  <div style={{ fontSize:13, fontWeight:600, color:c.text, marginBottom:12 }}>🔧 Reparaciones pendientes</div>
                  {repPendientes.length===0 && <p style={{ color:c.muted, fontSize:12 }}>Sin pendientes</p>}
                  {repPendientes.slice(0,5).map((r: any) => (
                    <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${c.border}`, fontSize:12 }}>
                      <span style={{ color:c.text }}>{r.cliente_nombre} — {r.modelo_celular}</span>
                      <span style={{ ...estadoColor(r.estado), padding:'2px 8px', borderRadius:50, fontSize:10 }}>{r.estado}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NUEVA VENTA CON CARRITO */}
          {seccion==='ventas' && (
            <div style={{ display:'flex', gap:16, height:'calc(100vh - 96px)' }}>
              <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
                <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                  <input style={{ ...s.input, marginBottom:0, flex:1, minWidth:140, padding:'7px 12px' }} placeholder="🔍 Buscar producto..." value={busquedaVenta} onChange={e => setBusquedaVenta(e.target.value)} />
                  <select style={{ ...s.input, marginBottom:0, width:'auto', padding:'7px 12px' }} value={categoriaFiltroVenta} onChange={e => setCategoriaFiltroVenta(e.target.value)}>
                    <option value="Todas">Todas</option>
                    {categorias.map((cat: any) => <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>)}
                  </select>
                </div>
                <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:8, alignContent:'start' }}>
                  {productosFiltradosVenta.length===0 && <div style={{ gridColumn:'1/-1', textAlign:'center', color:c.muted, padding:40 }}>Sin productos</div>}
                  {productosFiltradosVenta.map((p: any) => <ProductoCardVenta key={p.id} p={p} />)}
                </div>
              </div>

              {/* PANEL CARRITO */}
              <div style={{ width:300, minWidth:300, background:c.card, border:`1px solid ${c.border}`, borderRadius:16, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                <div style={{ padding:'14px 16px', borderBottom:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontWeight:700, fontSize:14, color:c.text }}>🛒 Carrito ({carrito.length})</span>
                  {carrito.length > 0 && <button style={{ ...s.btnRed, padding:'3px 10px', fontSize:11 }} onClick={limpiarCarrito}>Vaciar</button>}
                </div>
                <div style={{ flex:1, overflowY:'auto', padding:'10px 12px' }}>
                  {carrito.length===0 && (
                    <div style={{ textAlign:'center', padding:30, color:c.muted }}>
                      <div style={{ fontSize:32, marginBottom:8 }}>🛒</div>
                      <div style={{ fontSize:12 }}>Tocá un producto para agregarlo</div>
                    </div>
                  )}
                  {carrito.map((item: any) => (
                    <div key={item.id} style={{ background:c.card2, borderRadius:10, padding:'10px 12px', marginBottom:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:c.text, flex:1, marginRight:8 }}>{item.nombre}</span>
                        <button style={{ ...s.btnRed, padding:'1px 7px', fontSize:10 }} onClick={() => quitarDelCarrito(item.id)}>✕</button>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <button onClick={() => cambiarCantidadCarrito(item.id, item.cantidad-1)} style={{ width:24, height:24, borderRadius:50, background:'rgba(255,75,110,0.15)', border:'none', color:'#FF4B6E', cursor:'pointer', fontSize:14 }}>−</button>
                          <span style={{ fontSize:13, fontWeight:700, color:c.text, minWidth:20, textAlign:'center' }}>{item.cantidad}</span>
                          <button onClick={() => cambiarCantidadCarrito(item.id, item.cantidad+1)} style={{ width:24, height:24, borderRadius:50, background:'rgba(0,217,126,0.15)', border:'none', color:'#00D97E', cursor:'pointer', fontSize:14 }}>+</button>
                        </div>
                        <span style={{ fontSize:13, fontWeight:700, color:'#00D97E' }}>{formatGs(item.precio_venta*item.cantidad)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Item manual */}
                <div style={{ padding:'0 12px 10px' }}>
                  <div style={{ background:c.card2, borderRadius:10, padding:'10px 12px' }}>
                    <div style={{ fontSize:11, color:c.muted, marginBottom:6, textTransform:'uppercase', letterSpacing:'.5px' }}>+ Item manual</div>
                    <input ref={manualNombreRef} style={{ ...s.input, marginBottom:6, padding:'7px 10px', fontSize:12 }} placeholder="Nombre del producto" />
                    <div style={{ display:'flex', gap:6 }}>
                      <input ref={manualPrecioRef} style={{ ...s.input, marginBottom:0, flex:1, padding:'7px 8px', fontSize:12 }} type="number" placeholder="Precio Gs." />
                      <input ref={manualCantRef} style={{ ...s.input, marginBottom:0, width:55, padding:'7px 6px', fontSize:12 }} type="number" placeholder="Cant" defaultValue="1" />
                      <button style={{ ...s.btnGreen, padding:'6px 10px', fontSize:12, flexShrink:0 }} onClick={() => {
                        const nombre = manualNombreRef.current?.value
                        const precio = Number(manualPrecioRef.current?.value)
                        const cant = Number(manualCantRef.current?.value) || 1
                        if (!nombre || !precio) return
                        setCarrito(prev => [...prev, { id:'manual-'+Date.now(), nombre, precio_venta:precio, cantidad:cant, foto_url:null, stock_actual:99 }])
                        if (manualNombreRef.current) manualNombreRef.current.value = ''
                        if (manualPrecioRef.current) manualPrecioRef.current.value = ''
                        if (manualCantRef.current) manualCantRef.current.value = '1'
                      }}>+</button>
                    </div>
                  </div>
                </div>

                {carrito.length > 0 && (
                  <div style={{ padding:'0 14px 14px' }}>
                    <input style={{ ...s.input, marginBottom:8, padding:'8px 12px', fontSize:12 }} placeholder="Cliente (opcional)" value={carritoCliente} onChange={e => setCarritoCliente(e.target.value)} />
                    <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                      <select style={{ ...s.input, marginBottom:0, flex:1, padding:'7px 8px', fontSize:12 }} value={carritoDescTipo} onChange={e => { setCarritoDescTipo(e.target.value); setCarritoDescValor('') }}>
                        <option value="ninguno">Sin descuento</option>
                        <option value="guaranies">Descuento Gs.</option>
                        <option value="porcentaje">Descuento %</option>
                      </select>
                      {carritoDescTipo !== 'ninguno' && <input style={{ ...s.input, marginBottom:0, width:80, padding:'7px 6px', fontSize:12 }} type="number" placeholder={carritoDescTipo==='porcentaje'?'%':'Gs.'} value={carritoDescValor} onChange={e => setCarritoDescValor(e.target.value)} />}
                    </div>
                    <select style={{ ...s.input, marginBottom:8, padding:'7px 12px', fontSize:12 }} value={carritoMetodo} onChange={e => setCarritoMetodo(e.target.value)}>
                      <option>Efectivo</option><option>Transferencia</option><option>Cuotas</option>
                    </select>
                    {carritoMetodo === 'Cuotas' && (
                      <input style={{ ...s.input, marginBottom:8, padding:'7px 12px', fontSize:12 }} type="number" min="2" placeholder="N° de cuotas" value={carritoCuotas} onChange={e => setCarritoCuotas(e.target.value)} />
                    )}
                    {/* Vuelto */}
                    {carritoMetodo === 'Efectivo' && (
                      <div style={{ marginBottom:8 }}>
                        <input style={{ ...s.input, marginBottom:4, padding:'8px 12px', fontSize:12 }} type="number" placeholder="Monto recibido del cliente (Gs.)" value={carritoMontoRecibido} onChange={e => setCarritoMontoRecibido(e.target.value)} />
                        {Number(carritoMontoRecibido) > 0 && carritoVuelto > 0 && (
                          <div style={{ background:'rgba(0,217,126,0.1)', border:'1px solid rgba(0,217,126,0.3)', borderRadius:10, padding:'8px 12px', display:'flex', justifyContent:'space-between' }}>
                            <span style={{ fontSize:13, color:c.muted }}>Vuelto</span>
                            <span style={{ fontSize:16, fontWeight:700, color:'#00D97E' }}>{formatGs(carritoVuelto)}</span>
                          </div>
                        )}
                        {Number(carritoMontoRecibido) > 0 && Number(carritoMontoRecibido) < carritoTotal && (
                          <div style={{ background:'rgba(255,75,110,0.1)', border:'1px solid rgba(255,75,110,0.3)', borderRadius:10, padding:'8px 12px' }}>
                            <span style={{ fontSize:12, color:'#FF4B6E' }}>⚠️ Monto insuficiente — falta {formatGs(carritoTotal - Number(carritoMontoRecibido))}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Totales */}
                    <div style={{ background:c.card2, borderRadius:10, padding:'10px 12px', marginBottom:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:c.muted, marginBottom:3 }}><span>Subtotal</span><span>{formatGs(carritoSubtotal)}</span></div>
                      {carritoDescuento > 0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#FF4B6E', marginBottom:3 }}><span>Descuento</span><span>-{formatGs(carritoDescuento)}</span></div>}
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:700, color:'#5BC4F5', borderTop:`1px solid ${c.border}`, paddingTop:6, marginTop:4 }}><span>TOTAL</span><span>{formatGs(carritoTotal)}</span></div>
                    </div>
                    <button style={{ ...s.btnYellow, width:'100%', justifyContent:'center', padding:'12px', fontSize:14 }} onClick={confirmarVentaCarrito}>
                      ✅ Confirmar venta
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HISTORIAL */}
          {seccion==='historial' && (
            <div>
              <div style={s.grid4}>
                <StatCard label="Caja del día" value={formatGs(balanceHoy)} color="#00D97E" emoji="💵" />
                <StatCard label={`Balance ${mesActual}`} value={formatGs(balanceMes)} color="#5BC4F5" emoji="📆" />
                <StatCard label="Ventas hoy" value={ventasHoy.length} color="#FFD600" emoji="🛍" />
                <StatCard label="Ventas mes" value={ventasMes.length} color="#6B8AFF" emoji="📊" />
              </div>
              <div style={s.card}>
                <table style={s.table}>
                  <thead><tr>{['Producto','Cliente','Método','Total','Saldo','Estado','Fecha','Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {ventas.length===0 && <tr><td colSpan={8} style={{ ...s.td, textAlign:'center', color:c.muted, padding:32 }}>Sin ventas</td></tr>}
                    {ventas.map((v: any) => (
                      <tr key={v.id}>
                        <td style={{ ...s.td, fontWeight:500, maxWidth:180, fontSize:12 }}>{v.nombre_producto||'—'}</td>
                        <td style={s.td}>{v.cliente_nombre||'—'}</td>
                        <td style={s.td}>{v.metodo_pago}</td>
                        <td style={{ ...s.td, color:'#00D97E', fontWeight:600 }}>{formatGs(v.total)}</td>
                        <td style={{ ...s.td, color:v.saldo_pendiente>0?'#FF4B6E':c.muted }}>{v.saldo_pendiente>0?formatGs(v.saldo_pendiente):'—'}</td>
                        <td style={s.td}><span style={{ background:v.estado_pago==='Pagado'?'rgba(0,217,126,0.12)':'rgba(255,214,0,0.12)', color:v.estado_pago==='Pagado'?'#00D97E':'#FFD600', padding:'2px 8px', borderRadius:50, fontSize:11 }}>{v.estado_pago||'Pagado'}</span></td>
                        <td style={{ ...s.td, fontSize:11, color:c.muted }}>{formatFecha(v.created_at)}</td>
                        <td style={s.td}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button style={s.btnBlue} onClick={() => setTicketVenta(v)}>🧾</button>
                            {v.estado_pago==='Pendiente' && <button style={s.btnGreen} onClick={() => { setVentaSeleccionada(v); setTipoModal('pago'); setShowModal(true) }}>💳</button>}
                            <button style={s.btnRed} onClick={() => eliminarVenta(v.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STOCK */}
          {seccion==='stock' && (
            <div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                {listaCategorias.map(cat => <button key={cat} onClick={() => setCategoriaFiltro(cat)} style={{ background:categoriaFiltro===cat?'#1A3AFF':c.input, color:categoriaFiltro===cat?'#fff':c.muted, border:`1px solid ${categoriaFiltro===cat?'#1A3AFF':c.border}`, borderRadius:50, padding:'5px 14px', fontSize:12, cursor:'pointer' }}>{cat}</button>)}
              </div>
              {categoriaFiltro==='Todas' && !busqueda ? (
                Object.keys(productosAgrupados).length===0
                  ? <div style={{ ...s.card, textAlign:'center', color:c.muted, padding:40 }}>Sin productos</div>
                  : Object.entries(productosAgrupados).map(([cat, prods]: any) => (
                    <div key={cat} style={s.card}>
                      <div style={{ fontSize:13, fontWeight:600, color:c.text, marginBottom:12 }}>📁 {cat} ({prods.length})</div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
                        {prods.map((p: any) => <ProductoCardStock key={p.id} p={p} />)}
                      </div>
                    </div>
                  ))
              ) : (
                <div style={s.card}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
                    {productosFiltrados.map((p: any) => <ProductoCardStock key={p.id} p={p} />)}
                    {productosFiltrados.length===0 && <div style={{ gridColumn:'1/-1', textAlign:'center', color:c.muted, padding:32 }}>No encontrado</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CUOTAS / DEUDAS */}
          {seccion==='cuotas' && (
            <div>
              <div style={s.grid4}>
                <StatCard label="Con deuda" value={ventasConDeuda.length} color="#FF4B6E" emoji="💳" />
                <StatCard label="Total adeudado" value={formatGs(totalDeuda)} color="#FFD600" emoji="💰" />
                <StatCard label="Pagadas completas" value={ventas.filter((v: any) => v.metodo_pago==='Cuotas'&&v.estado_pago==='Pagado').length} color="#00D97E" emoji="✅" />
                <StatCard label="Total en cuotas" value={ventas.filter((v: any) => v.metodo_pago==='Cuotas').length} color="#5BC4F5" emoji="📋" />
              </div>
              {ventasConDeuda.length===0 ? (
                <div style={{ ...s.card, textAlign:'center', padding:40 }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                  <div style={{ fontSize:16, fontWeight:600, color:c.text }}>¡Sin deudas pendientes!</div>
                </div>
              ) : ventasConDeuda.map((v: any) => {
                const pagosDeEstaVenta = pagosCuotas.filter((p: any) => p.venta_id===v.id)
                const totalPagado = pagosDeEstaVenta.reduce((s: number, p: any) => s+(p.monto||0), 0)
                return (
                  <div key={v.id} style={s.card}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                      <div style={{ fontSize:22, width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,75,110,0.15)', flexShrink:0 }}>💳</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:14, color:c.text }}>{v.cliente_nombre||'Cliente'}</div>
                        <div style={{ fontSize:12, color:c.muted, marginTop:2 }}>{v.nombre_producto||'Producto'} · Total: {formatGs(v.total)}</div>
                        <div style={{ marginTop:8, height:6, background:c.border, borderRadius:3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${v.total>0?Math.min(100,Math.round((totalPagado/v.total)*100)):0}%`, background:'linear-gradient(90deg,#1A3AFF,#5BC4F5)', borderRadius:3 }} />
                        </div>
                        <div style={{ fontSize:11, color:c.muted, marginTop:4 }}>Pagado: {formatGs(totalPagado)} · Saldo: {formatGs(v.saldo_pendiente||0)}</div>
                        {pagosDeEstaVenta.length > 0 && (
                          <div style={{ marginTop:10, background:c.card2, borderRadius:10, padding:10 }}>
                            <div style={{ fontSize:11, color:c.muted, marginBottom:6, textTransform:'uppercase', letterSpacing:'.5px' }}>Historial de pagos</div>
                            {pagosDeEstaVenta.map((p: any) => (
                              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'4px 0', borderBottom:`1px solid ${c.border}` }}>
                                <span style={{ color:c.muted }}>{formatFecha(p.fecha)} · {p.empleado}</span>
                                <span style={{ color:'#00D97E', fontWeight:600 }}>+{formatGs(p.monto)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0, display:'flex', flexDirection:'column', gap:6 }}>
                        <div style={{ fontSize:11, color:c.muted }}>Saldo restante</div>
                        <div style={{ fontSize:18, fontWeight:700, color:'#FF4B6E' }}>{formatGs(v.saldo_pendiente||0)}</div>
                        <button style={s.btnGreen} onClick={() => { setVentaSeleccionada(v); setTipoModal('pago'); setShowModal(true) }}>💰 Pago</button>
                        <button style={s.btnBlue} onClick={() => {
                          setEditandoDeuda(v)
                          setFormEditDeuda({ cliente_nombre:v.cliente_nombre||'', nombre_producto:v.nombre_producto||'', saldo_pendiente:String(v.saldo_pendiente||0), estado_pago:v.estado_pago||'Pendiente' })
                          setTipoModal('editDeuda'); setShowModal(true)
                        }}>✏️ Editar</button>
                        <button style={s.btnRed} onClick={() => eliminarDeuda(v.id)}>🗑 Borrar</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* TÉCNICO */}
          {seccion==='tecnico' && (
            <div>
              {reparaciones.map((r: any) => (
                <div key={r.id} style={{ ...s.card, display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ fontSize:22, width:42, height:42, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(26,58,255,0.15)', flexShrink:0 }}>📱</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500, fontSize:13, color:c.text }}>{r.cliente_nombre} — {r.cliente_telefono}</div>
                    {r.cliente_direccion && <div style={{ fontSize:11, color:c.muted }}>📍 {r.cliente_direccion}</div>}
                    <div style={{ fontSize:11, color:c.muted }}>{r.modelo_celular}</div>
                    <div style={{ fontSize:12, color:'#5BC4F5', marginTop:2 }}>{r.problema_reportado}</div>
                    {r.costo_estimado && <div style={{ fontSize:12, color:'#FFD600', marginTop:2 }}>Costo: {formatGs(r.costo_estimado)}</div>}
                    {r.garantia && <div style={{ fontSize:11, color:c.muted, marginTop:2 }}>Garantía: {r.garantia}</div>}
                    {r.observaciones && <div style={{ fontSize:11, color:c.muted, marginTop:2 }}>Obs: {r.observaciones}</div>}
                  </div>
                  <div style={{ textAlign:'right', display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                    <span style={{ ...estadoColor(r.estado), padding:'3px 10px', borderRadius:50, fontSize:11 }}>{r.estado}</span>
                    <select value={r.estado} onChange={e => cambiarEstadoRep(r.id, e.target.value)}
                      style={{ background:c.input, border:`1px solid ${c.border}`, borderRadius:8, padding:'4px 8px', color:c.text, fontSize:11, cursor:'pointer' }}>
                      <option>Recibido</option><option>Diagnóstico</option><option>Esperando repuesto</option>
                      <option>En reparación</option><option>Terminado</option><option>Entregado</option>
                    </select>
                    <div style={{ display:'flex', gap:6 }}>
                      <button style={s.btnBlue} onClick={() => setTicketRep(r)}>📋 Orden</button>
                      <button style={s.btnRed} onClick={() => eliminarReparacion(r.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
              {reparaciones.length===0 && <div style={{ ...s.card, textAlign:'center', color:c.muted, padding:40 }}>Sin reparaciones</div>}
            </div>
          )}

          {/* CLIENTES */}
          {seccion==='clientes' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
              {clientes.length===0 && <div style={{ ...s.card, textAlign:'center', color:c.muted, padding:40 }}>Sin clientes</div>}
              {clientes.map((cl: any) => (
                <div key={cl.id} style={s.card}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#1A3AFF,#5BC4F5)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color:'#fff' }}>{cl.nombre[0]}{cl.apellido?.[0]||''}</div>
                    <div style={{ flex:1 }}><div style={{ fontWeight:500, fontSize:13, color:c.text }}>{cl.nombre} {cl.apellido}</div><div style={{ fontSize:11, color:c.muted }}>{cl.ciudad}</div></div>
                    <button style={{ ...s.btnRed, padding:'3px 8px' }} onClick={() => eliminarCliente(cl.id)}>🗑</button>
                  </div>
                  {cl.telefono && <div style={{ fontSize:12, color:c.muted, marginBottom:4 }}>📞 {cl.telefono}</div>}
                  {cl.whatsapp && <a href={`https://wa.me/595${cl.whatsapp.replace(/\D/g,'').replace(/^0/,'')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:'#00D97E', textDecoration:'none' }}>💬 WhatsApp</a>}
                </div>
              ))}
            </div>
          )}

          {/* GASTOS */}
          {seccion==='gastos' && (
            <div>
              <div style={s.grid4}>
                <StatCard label="Gastos operativos" value={formatGs(totalGastosMes)} color="#FF4B6E" emoji="💸" />
                <StatCard label="Inversiones mes" value={formatGs(totalInversionesMes)} color="#FFD600" emoji="💼" />
                <StatCard label="Ingresos mes" value={formatGs(balanceMes)} color="#00D97E" emoji="📈" />
                <StatCard label="Ganancia neta" value={formatGs(gananciaNeta)} color={gananciaNeta>=0?'#00D97E':'#FF4B6E'} emoji="💎" />
              </div>
              <div style={{ display:'flex', gap:0, marginBottom:14, background:c.card2, borderRadius:12, padding:4, width:'fit-content' }}>
                {['todos','Gasto','Inversión'].map(t => (
                  <button key={t} onClick={() => setCategoriaFiltro(t)}
                    style={{ padding:'6px 16px', borderRadius:9, border:'none', cursor:'pointer', fontSize:13, background:categoriaFiltro===t?'#1A3AFF':'transparent', color:categoriaFiltro===t?'#fff':c.muted, fontWeight:categoriaFiltro===t?600:400 }}>
                    {t==='todos'?'Todos':t==='Gasto'?'💸 Gastos':'💼 Inversiones'}
                  </button>
                ))}
              </div>
              <div style={s.card}>
                <table style={s.table}>
                  <thead><tr>{['Fecha','Descripción','Categoría','Tipo','Monto','Acción'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {gastos.filter(g => categoriaFiltro==='todos' || g.tipo===categoriaFiltro).length===0 && <tr><td colSpan={6} style={{ ...s.td, textAlign:'center', color:c.muted, padding:32 }}>Sin registros</td></tr>}
                    {gastos.filter(g => categoriaFiltro==='todos' || g.tipo===categoriaFiltro).map((g: any) => (
                      <tr key={g.id}>
                        <td style={{ ...s.td, fontSize:11, color:c.muted }}>{formatFecha(g.fecha)}</td>
                        <td style={{ ...s.td, fontWeight:500 }}>{g.descripcion}</td>
                        <td style={s.td}><span style={{ background:'rgba(255,75,110,0.1)', color:'#FF4B6E', padding:'2px 8px', borderRadius:50, fontSize:11 }}>{g.categoria}</span></td>
                        <td style={s.td}><span style={{ background:g.tipo==='Inversión'?'rgba(255,214,0,0.15)':'rgba(255,75,110,0.1)', color:g.tipo==='Inversión'?'#FFD600':'#FF4B6E', padding:'2px 8px', borderRadius:50, fontSize:11 }}>{g.tipo==='Inversión'?'💼 Inversión':'💸 Gasto'}</span></td>
                        <td style={{ ...s.td, color:g.tipo==='Inversión'?'#FFD600':'#FF4B6E', fontWeight:600 }}>{formatGs(g.monto)}</td>
                        <td style={s.td}><button style={s.btnRed} onClick={() => eliminarGasto(g.id)}>🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CAJA */}
          {seccion==='caja' && (
            <div>
              <div style={{ ...s.card, background:estadoCaja==='abierta'?'rgba(0,217,126,0.07)':estadoCaja==='cerrada'?'rgba(255,75,110,0.07)':'rgba(255,214,0,0.07)', border:`1px solid ${estadoCaja==='abierta'?'rgba(0,217,126,0.3)':estadoCaja==='cerrada'?'rgba(255,75,110,0.3)':'rgba(255,214,0,0.3)'}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ fontSize:36 }}>{estadoCaja==='abierta'?'🟢':estadoCaja==='cerrada'?'🔴':'🟡'}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:16, fontWeight:700, color:c.text }}>{estadoCaja==='abierta'?'Caja abierta':estadoCaja==='cerrada'?'Caja cerrada':'Sin movimiento hoy'}</div>
                    {cajaAbierta && <div style={{ fontSize:12, color:c.muted, marginTop:2 }}>Apertura por: {(cajaAbierta as any).empleado} a las {formatHora((cajaAbierta as any).created_at)}</div>}
                    {cajaCerrada && <div style={{ fontSize:12, color:c.muted, marginTop:2 }}>Cierre por: {(cajaCerrada as any).empleado} a las {formatHora((cajaCerrada as any).created_at)}</div>}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:11, color:c.muted, marginBottom:4 }}>Caja neta del día</div>
                    <div style={{ fontSize:22, fontWeight:700, color:'#00D97E' }}>{formatGs(balanceHoy)}</div>
                    {totalGastosHoy > 0 && <div style={{ fontSize:11, color:'#FF4B6E' }}>-{formatGs(totalGastosHoy)} gastos</div>}
                  </div>
                </div>
              </div>
              <div style={s.grid4}>
                <StatCard label="Ventas hoy" value={ventasHoy.length} color="#5BC4F5" emoji="🛍" />
                <StatCard label="Ingresos brutos" value={formatGs(ingresosBrutoHoy)} color="#00D97E" emoji="💰" />
                <StatCard label="Gastos hoy" value={formatGs(totalGastosHoy)} color="#FF4B6E" emoji="💸" />
                <StatCard label="Caja neta" value={formatGs(balanceHoy)} color="#FFD600" emoji="🏦" />
              </div>
              <div style={s.card}>
                <div style={{ fontSize:13, fontWeight:600, color:c.text, marginBottom:12 }}>📋 Historial de caja</div>
                <table style={s.table}>
                  <thead><tr>{['Fecha','Tipo','Empleado','Monto inicial','Hora','Obs'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {cajaRegistros.length===0 && <tr><td colSpan={6} style={{ ...s.td, textAlign:'center', color:c.muted, padding:32 }}>Sin registros</td></tr>}
                    {cajaRegistros.map((cj: any) => (
                      <tr key={cj.id}>
                        <td style={{ ...s.td, fontSize:11, color:c.muted }}>{formatFecha(cj.fecha)}</td>
                        <td style={s.td}><span style={{ background:cj.tipo==='apertura'?'rgba(0,217,126,0.12)':'rgba(255,75,110,0.12)', color:cj.tipo==='apertura'?'#00D97E':'#FF4B6E', padding:'2px 8px', borderRadius:50, fontSize:11 }}>{cj.tipo==='apertura'?'🟢 Apertura':'🔴 Cierre'}</span></td>
                        <td style={{ ...s.td, fontWeight:500 }}>{cj.empleado}</td>
                        <td style={s.td}>{cj.monto_inicial>0?formatGs(cj.monto_inicial):'—'}</td>
                        <td style={{ ...s.td, fontSize:11, color:c.muted }}>{formatHora(cj.created_at)}</td>
                        <td style={{ ...s.td, fontSize:11, color:c.muted }}>{cj.observaciones||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BALANCE */}
          {seccion==='balance' && (
            <div>
              <div style={{ ...s.card, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:600, color:c.text }}>📊 Período:</div>
                <select style={{ ...s.input, marginBottom:0, width:'auto', padding:'7px 14px' }} value={mesBalance} onChange={e => setMesBalance(Number(e.target.value))}>
                  {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select style={{ ...s.input, marginBottom:0, width:'auto', padding:'7px 14px' }} value={anioBalance} onChange={e => setAnioBalance(Number(e.target.value))}>
                  {[2024,2025,2026,2027].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <button style={s.btnYellow} onClick={() => window.print()}>🖨 Imprimir</button>
              </div>
              <div className="print-area" style={{ border:`2px solid ${c.border}`, borderRadius:16, overflow:'hidden' }}>
                <PaginaBalance />
              </div>
            </div>
          )}

          {/* CATEGORÍAS */}
          {seccion==='categorias' && (
            <div>
              <div style={s.card}>
                <div style={{ fontSize:13, fontWeight:600, color:c.text, marginBottom:14 }}>➕ Crear nueva categoría</div>
                <div style={{ display:'flex', gap:10 }}>
                  <input style={{ ...s.input, marginBottom:0, flex:1 }} placeholder="Ej: Fundas, Cables..." value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} onKeyDown={e => e.key==='Enter' && agregarCategoria()} />
                  <button style={s.btnYellow} onClick={agregarCategoria}>Agregar</button>
                </div>
              </div>
              {categorias.map((cat: any) => {
                const prodsEnCat = productos.filter(p => p.categoria===cat.nombre)
                const prodsOtrasCats = productos.filter(p => p.categoria!==cat.nombre)
                const estaEditando = editandoCategoria===cat.id
                return (
                  <div key={cat.id} style={s.card}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                      {estaEditando ? (
                        <>
                          <input style={{ ...s.input, marginBottom:0, flex:1 }} value={nombreCatEdit} onChange={e => setNombreCatEdit(e.target.value)} autoFocus />
                          <button style={s.btnYellow} onClick={() => guardarEditCategoria(cat.id)}>Guardar</button>
                          <button style={s.btnGray} onClick={() => { setEditandoCategoria(null); setNombreCatEdit('') }}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize:14, fontWeight:600, color:c.text, flex:1 }}>📁 {cat.nombre} <span style={{ fontSize:12, color:c.muted, fontWeight:400 }}>({prodsEnCat.length})</span></span>
                          <button style={s.btnBlue} onClick={() => { setEditandoCategoria(cat.id); setNombreCatEdit(cat.nombre) }}>✏️ Editar</button>
                          <button style={s.btnRed} onClick={() => eliminarCategoria(cat.id)}>🗑</button>
                        </>
                      )}
                    </div>
                    {prodsEnCat.length > 0 && (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8, marginBottom:prodsOtrasCats.length>0?12:0 }}>
                        {prodsEnCat.map((p: any) => (
                          <div key={p.id} style={{ background:c.card2, border:`1px solid ${c.border}`, borderRadius:10, padding:10, display:'flex', alignItems:'center', gap:8 }}>
                            {p.foto_url && <img src={p.foto_url} alt="" style={{ width:32, height:32, objectFit:'contain', borderRadius:6, background:c.card, flexShrink:0 }} />}
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:500, color:c.text, marginBottom:2 }}>{p.nombre}</div>
                              <div style={{ fontSize:11, color:c.muted }}>{formatGs(p.precio_venta)}</div>
                            </div>
                            <select value={cat.nombre} onChange={e => moverProductoCategoria(p.id, e.target.value)}
                              style={{ background:c.input, border:`1px solid ${c.border}`, borderRadius:6, padding:'3px 6px', color:c.muted, fontSize:10, cursor:'pointer', maxWidth:90 }}>
                              <option value={cat.nombre}>📁 {cat.nombre}</option>
                              {categorias.filter((cc: any) => cc.id!==cat.id).map((cc: any) => <option key={cc.id} value={cc.nombre}>→ {cc.nombre}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                    {prodsOtrasCats.length > 0 && (
                      <div style={{ borderTop:`1px solid ${c.border}`, paddingTop:10 }}>
                        <div style={{ fontSize:11, color:c.muted, marginBottom:8 }}>Mover producto a esta categoría:</div>
                        <select defaultValue="" onChange={e => { if (e.target.value) { moverProductoCategoria(e.target.value, cat.nombre); (e.target as any).value='' } }}
                          style={{ ...s.input, marginBottom:0, maxWidth:320 }}>
                          <option value="">Seleccionar producto...</option>
                          {prodsOtrasCats.map((p: any) => <option key={p.id} value={p.id}>{p.nombre} (en: {p.categoria||'sin categoría'})</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>

      {/* MODALES */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontWeight:700, fontSize:16, color:c.text }}>
                {tipoModal==='producto' && (productoEditando ? '✏️ Editar producto' : '📦 Nuevo producto')}
                {tipoModal==='reparacion' && '🔧 Registrar equipo'}
                {tipoModal==='cliente' && '👥 Nuevo cliente'}
                {tipoModal==='gasto' && '💸 Gasto / Inversión'}
                {tipoModal==='pago' && '💳 Registrar pago'}
                {tipoModal==='caja' && '🏦 Movimiento de caja'}
                {tipoModal==='editDeuda' && '✏️ Editar deuda'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background:'rgba(255,255,255,0.06)', border:'none', color:c.muted, width:30, height:30, borderRadius:8, cursor:'pointer', fontSize:18 }}>×</button>
            </div>

            {tipoModal==='producto' && (
              <div>
                <Label text="Categoría" />
                <select style={s.input} value={formProducto.categoria} onChange={e => setFormProducto({ ...formProducto, categoria:e.target.value })}>
                  {categorias.map((cat: any) => <option key={cat.id}>{cat.nombre}</option>)}
                </select>
                <Label text="Nombre del producto" />
                <input style={s.input} placeholder="Ej: Case iPhone 15" value={formProducto.nombre} onChange={e => setFormProducto({ ...formProducto, nombre:e.target.value })} />
                <Label text="Foto del producto" />
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFoto} />
                <button style={{ ...s.btnBlue, marginBottom:10, display:'block' }} onClick={() => (fileRef.current as any)?.click()}>📷 Cargar foto</button>
                {fotoPreview && (
                  <div style={{ position:'relative', marginBottom:10 }}>
                    <img src={fotoPreview} alt="" style={{ width:'100%', height:120, objectFit:'contain', borderRadius:10, background:c.card2 }} />
                    <button style={{ ...s.btnRed, position:'absolute', top:6, right:6, padding:'2px 8px', fontSize:11 }} onClick={() => { setFotoPreview(''); setFormProducto(f => ({ ...f, foto_url:'' })) }}>✕</button>
                  </div>
                )}
                <Label text="Precio de compra (Gs)" />
                <input style={s.input} type="number" placeholder="0" value={formProducto.precio_compra} onChange={e => setFormProducto({ ...formProducto, precio_compra:e.target.value })} />
                <Label text="Precio de venta (Gs)" />
                <input style={s.input} type="number" placeholder="0" value={formProducto.precio_venta} onChange={e => setFormProducto({ ...formProducto, precio_venta:e.target.value })} />
                {formProducto.precio_compra && formProducto.precio_venta && (
                  <div style={{ background:'rgba(0,217,126,0.08)', border:'1px solid rgba(0,217,126,0.2)', borderRadius:10, padding:'8px 12px', marginBottom:10, fontSize:12, color:'#00D97E' }}>
                    Ganancia: +{formatGs(Number(formProducto.precio_venta)-Number(formProducto.precio_compra))}
                  </div>
                )}
                <Label text="Stock" />
                <input style={s.input} type="number" placeholder="0" value={formProducto.stock_actual} onChange={e => setFormProducto({ ...formProducto, stock_actual:e.target.value })} />
                <Label text="IMEI (solo celulares)" />
                <input style={s.input} placeholder="15 dígitos" value={formProducto.imei} onChange={e => setFormProducto({ ...formProducto, imei:e.target.value })} />
                <button style={{ ...s.btnYellow, width:'100%', marginTop:8 }} onClick={guardarProducto}>
                  {productoEditando ? 'Guardar cambios' : 'Guardar producto'}
                </button>
              </div>
            )}

            {tipoModal==='pago' && ventaSeleccionada && (
              <div>
                <div style={{ background:'rgba(26,58,255,0.08)', border:'1px solid rgba(26,58,255,0.2)', borderRadius:12, padding:14, marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:c.text, marginBottom:4 }}>{ventaSeleccionada.cliente_nombre||'Cliente'}</div>
                  <div style={{ fontSize:12, color:c.muted, marginBottom:8 }}>{ventaSeleccionada.nombre_producto||'Producto'}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, marginTop:4 }}>
                    <span style={{ color:c.muted }}>Saldo pendiente</span>
                    <span style={{ fontWeight:700, color:'#FF4B6E' }}>{formatGs(ventaSeleccionada.saldo_pendiente||0)}</span>
                  </div>
                </div>
                <Label text="Monto que paga ahora (Gs)" />
                <input style={s.input} type="number" placeholder={`Máx: ${ventaSeleccionada.saldo_pendiente}`} value={formPago.monto} onChange={e => setFormPago({ ...formPago, monto:e.target.value })} />
                {formPago.monto && Number(formPago.monto) > 0 && (
                  <div style={{ background:'rgba(0,217,126,0.08)', border:'1px solid rgba(0,217,126,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                      <span style={{ color:c.muted }}>Nuevo saldo</span>
                      <span style={{ fontWeight:700, color:'#00D97E' }}>{formatGs(Math.max(0,(ventaSeleccionada.saldo_pendiente||0)-Number(formPago.monto)))}</span>
                    </div>
                  </div>
                )}
                <Label text="Empleado que recibe" />
                <select style={s.input} value={formPago.empleado} onChange={e => setFormPago({ ...formPago, empleado:e.target.value })}>
                  {EMPLEADOS.map(e => <option key={e}>{e}</option>)}
                </select>
                <Label text="Observaciones (opcional)" />
                <input style={s.input} placeholder="Notas..." value={formPago.observaciones} onChange={e => setFormPago({ ...formPago, observaciones:e.target.value })} />
                <button style={{ ...s.btnYellow, width:'100%', marginTop:8 }} onClick={registrarPagoParcial}>Registrar pago</button>
              </div>
            )}

            {tipoModal==='editDeuda' && editandoDeuda && (
              <div>
                <div style={{ background:'rgba(255,75,110,0.08)', border:'1px solid rgba(255,75,110,0.2)', borderRadius:12, padding:12, marginBottom:16, fontSize:12, color:'#FF4B6E' }}>
                  ⚠️ Editás directamente los datos de esta deuda.
                </div>
                <Label text="Nombre del cliente" />
                <input style={s.input} value={formEditDeuda.cliente_nombre} onChange={e => setFormEditDeuda({ ...formEditDeuda, cliente_nombre:e.target.value })} />
                <Label text="Producto / descripción" />
                <input style={s.input} value={formEditDeuda.nombre_producto} onChange={e => setFormEditDeuda({ ...formEditDeuda, nombre_producto:e.target.value })} />
                <Label text="Saldo pendiente (Gs)" />
                <input style={s.input} type="number" value={formEditDeuda.saldo_pendiente} onChange={e => setFormEditDeuda({ ...formEditDeuda, saldo_pendiente:e.target.value })} />
                <Label text="Estado" />
                <select style={s.input} value={formEditDeuda.estado_pago} onChange={e => setFormEditDeuda({ ...formEditDeuda, estado_pago:e.target.value })}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                </select>
                <button style={{ ...s.btnYellow, width:'100%', marginTop:8 }} onClick={guardarEditDeuda}>Guardar cambios</button>
              </div>
            )}

            {tipoModal==='reparacion' && (
              <div>
                <Label text="Nombre del cliente *" /><input style={s.input} placeholder="Nombre completo" value={formReparacion.cliente_nombre} onChange={e => setFormReparacion({ ...formReparacion, cliente_nombre:e.target.value })} />
                <Label text="Teléfono / WhatsApp *" /><input style={s.input} placeholder="09XX XXX XXX" value={formReparacion.cliente_telefono} onChange={e => setFormReparacion({ ...formReparacion, cliente_telefono:e.target.value })} />
                <Label text="Dirección (opcional)" /><input style={s.input} placeholder="Barrio, calle..." value={formReparacion.cliente_direccion} onChange={e => setFormReparacion({ ...formReparacion, cliente_direccion:e.target.value })} />
                <Label text="Modelo del celular *" /><input style={s.input} placeholder="Ej: iPhone 12, Samsung A32..." value={formReparacion.modelo_celular} onChange={e => setFormReparacion({ ...formReparacion, modelo_celular:e.target.value })} />
                <Label text="Problema reportado *" /><input style={s.input} placeholder="Describí el problema..." value={formReparacion.problema_reportado} onChange={e => setFormReparacion({ ...formReparacion, problema_reportado:e.target.value })} />
                <Label text="Garantía" />
                <select style={s.input} value={formReparacion.garantia} onChange={e => setFormReparacion({ ...formReparacion, garantia:e.target.value })}>
                  <option>Sin garantía</option><option>Display con garantía (30 días)</option>
                  <option>Display sin garantía (económico)</option><option>Garantía general (30 días)</option>
                  <option>Garantía general (15 días)</option>
                </select>
                <Label text="Técnico" />
                <select style={s.input} value={formReparacion.tecnico} onChange={e => setFormReparacion({ ...formReparacion, tecnico:e.target.value })}>
                  {EMPLEADOS.map(e => <option key={e}>{e}</option>)}
                </select>
                <Label text="Costo estimado (Gs) — opcional" /><input style={s.input} type="number" placeholder="0" value={formReparacion.costo_estimado} onChange={e => setFormReparacion({ ...formReparacion, costo_estimado:e.target.value })} />
                <Label text="Observaciones — opcional" /><input style={s.input} placeholder="Notas adicionales..." value={formReparacion.observaciones} onChange={e => setFormReparacion({ ...formReparacion, observaciones:e.target.value })} />
                {(!formReparacion.cliente_nombre||!formReparacion.cliente_telefono||!formReparacion.modelo_celular||!formReparacion.problema_reportado) && (
                  <div style={{ background:'rgba(255,75,110,0.08)', border:'1px solid rgba(255,75,110,0.2)', borderRadius:10, padding:'8px 12px', marginBottom:10, fontSize:12, color:'#FF4B6E' }}>⚠️ Completá los campos obligatorios (*)</div>
                )}
                <button style={{ ...s.btnYellow, width:'100%', marginTop:8, opacity:(!formReparacion.cliente_nombre||!formReparacion.cliente_telefono||!formReparacion.modelo_celular||!formReparacion.problema_reportado)?0.5:1 }}
                  onClick={guardarReparacion} disabled={!formReparacion.cliente_nombre||!formReparacion.cliente_telefono||!formReparacion.modelo_celular||!formReparacion.problema_reportado}>
                  Registrar y generar orden
                </button>
              </div>
            )}

            {tipoModal==='cliente' && (
              <div>
                <Label text="Nombre" /><input style={s.input} placeholder="Nombre" value={formCliente.nombre} onChange={e => setFormCliente({ ...formCliente, nombre:e.target.value })} />
                <Label text="Apellido" /><input style={s.input} placeholder="Apellido" value={formCliente.apellido} onChange={e => setFormCliente({ ...formCliente, apellido:e.target.value })} />
                <Label text="Teléfono" /><input style={s.input} placeholder="09XX XXX XXX" value={formCliente.telefono} onChange={e => setFormCliente({ ...formCliente, telefono:e.target.value })} />
                <Label text="WhatsApp" /><input style={s.input} placeholder="09XX XXX XXX" value={formCliente.whatsapp} onChange={e => setFormCliente({ ...formCliente, whatsapp:e.target.value })} />
                <Label text="Ciudad" />
                <select style={s.input} value={formCliente.ciudad} onChange={e => setFormCliente({ ...formCliente, ciudad:e.target.value })}>
                  <option>Quiindy</option><option>Otra</option>
                </select>
                <button style={{ ...s.btnYellow, width:'100%', marginTop:8 }} onClick={guardarCliente}>Guardar cliente</button>
              </div>
            )}

            {tipoModal==='gasto' && (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                  {[
                    { tipo:'Gasto', label:'💸 Gasto', desc:'Sale y no vuelve', color:'rgba(255,75,110,0.15)', border:'rgba(255,75,110,0.4)', text:'#FF4B6E' },
                    { tipo:'Inversión', label:'💼 Inversión', desc:'Se recupera con ventas', color:'rgba(255,214,0,0.15)', border:'rgba(255,214,0,0.4)', text:'#FFD600' },
                  ].map(opt => (
                    <div key={opt.tipo} onClick={() => setFormGasto({ ...formGasto, tipo:opt.tipo })}
                      style={{ background:formGasto.tipo===opt.tipo?opt.color:'transparent', border:`2px solid ${formGasto.tipo===opt.tipo?opt.border:c.border}`, borderRadius:12, padding:'12px', textAlign:'center', cursor:'pointer' }}>
                      <div style={{ fontSize:14, fontWeight:600, color:formGasto.tipo===opt.tipo?opt.text:c.muted }}>{opt.label}</div>
                      <div style={{ fontSize:10, color:c.muted, marginTop:2 }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
                <Label text="Descripción" />
                <input style={s.input} placeholder={formGasto.tipo==='Inversión'?'Ej: Compra de stock...':'Ej: Pago de luz, alquiler...'} value={formGasto.descripcion} onChange={e => setFormGasto({ ...formGasto, descripcion:e.target.value })} />
                <Label text="Categoría" />
                <select style={s.input} value={formGasto.categoria} onChange={e => setFormGasto({ ...formGasto, categoria:e.target.value })}>
                  {CATEGORIAS_GASTOS.map(cat => <option key={cat}>{cat}</option>)}
                </select>
                <Label text="Monto (Gs)" /><input style={s.input} type="number" placeholder="0" value={formGasto.monto} onChange={e => setFormGasto({ ...formGasto, monto:e.target.value })} />
                <Label text="Fecha" /><input style={s.input} type="date" value={formGasto.fecha} onChange={e => setFormGasto({ ...formGasto, fecha:e.target.value })} />
                <button style={{ ...s.btnYellow, width:'100%', marginTop:8 }} onClick={guardarGasto}>Guardar {formGasto.tipo}</button>
              </div>
            )}

            {tipoModal==='caja' && (
              <div>
                <Label text="Tipo de movimiento" />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                  {[
                    { tipo:'apertura', label:'🟢 Apertura', color:'rgba(0,217,126,0.15)', border:'rgba(0,217,126,0.4)', text:'#00D97E' },
                    { tipo:'cierre', label:'🔴 Cierre', color:'rgba(255,75,110,0.15)', border:'rgba(255,75,110,0.4)', text:'#FF4B6E' },
                  ].map(opt => (
                    <div key={opt.tipo} onClick={() => setFormCaja({ ...formCaja, tipo:opt.tipo })}
                      style={{ background:formCaja.tipo===opt.tipo?opt.color:'transparent', border:`2px solid ${formCaja.tipo===opt.tipo?opt.border:c.border}`, borderRadius:12, padding:12, textAlign:'center', cursor:'pointer', fontSize:13, fontWeight:formCaja.tipo===opt.tipo?600:400, color:formCaja.tipo===opt.tipo?opt.text:c.muted }}>
                      {opt.label}
                    </div>
                  ))}
                </div>
                <Label text="Empleado" />
                <select style={s.input} value={formCaja.empleado} onChange={e => setFormCaja({ ...formCaja, empleado:e.target.value })}>
                  {EMPLEADOS.map(e => <option key={e}>{e}</option>)}
                </select>
                {formCaja.tipo==='apertura' && (
                  <><Label text="Monto inicial (Gs)" /><input style={s.input} type="number" placeholder="0" value={formCaja.monto_inicial} onChange={e => setFormCaja({ ...formCaja, monto_inicial:e.target.value })} /></>
                )}
                {formCaja.tipo==='cierre' && (
                  <div style={{ background:'rgba(26,58,255,0.08)', border:'1px solid rgba(26,58,255,0.2)', borderRadius:12, padding:14, marginBottom:10 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:c.text, marginBottom:8 }}>Resumen del día</div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span style={{ color:c.muted }}>Ingresos brutos</span><span style={{ color:'#00D97E', fontWeight:600 }}>{formatGs(ingresosBrutoHoy)}</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span style={{ color:c.muted }}>Gastos del día</span><span style={{ color:'#FF4B6E' }}>-{formatGs(totalGastosHoy)}</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:700, borderTop:`1px solid ${c.border}`, paddingTop:6, marginTop:4 }}><span style={{ color:c.muted }}>Caja neta</span><span style={{ color:'#00D97E' }}>{formatGs(balanceHoy)}</span></div>
                  </div>
                )}
                <Label text="Observaciones (opcional)" /><input style={s.input} placeholder="Notas..." value={formCaja.observaciones} onChange={e => setFormCaja({ ...formCaja, observaciones:e.target.value })} />
                <button style={{ ...s.btnYellow, width:'100%', marginTop:8 }} onClick={guardarCaja}>
                  {formCaja.tipo==='apertura' ? '🟢 Abrir caja' : '🔴 Cerrar caja'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TICKET DE VENTA - optimizado para térmica */}
      {ticketVenta && (
        <div style={s.overlay} onClick={() => setTicketVenta(null)}>
          <div className="print-area" onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:12, padding:'20px', width:'100%', maxWidth:340, color:'#000' }}>
            <div style={{ textAlign:'center', marginBottom:12, borderBottom:'2px solid #000', paddingBottom:10 }}>
              <div style={{ fontSize:20, fontWeight:900, letterSpacing:2, fontFamily:'monospace' }}>NERY CELL</div>
              <div style={{ fontSize:12, fontWeight:600 }}>Tecnología · Accesorios · Reparaciones</div>
              <div style={{ fontSize:11 }}>Quiindy, Paraguarí</div>
              <div style={{ fontSize:11, fontWeight:700 }}>Tel: {CONTACTO.tel}</div>
            </div>
            <div style={{ textAlign:'center', fontSize:11, marginBottom:10, borderBottom:'1px dashed #000', paddingBottom:8 }}>
              <div style={{ fontWeight:700, fontSize:13 }}>COMPROBANTE DE VENTA</div>
              <div>{formatFecha(ticketVenta.created_at)} — {formatHora(ticketVenta.created_at)}</div>
              {ticketVenta.cajero && <div style={{ fontWeight:700 }}>Cajero: {ticketVenta.cajero}</div>}
            </div>
            {/* Detalle de items */}
            {ticketVenta.items && ticketVenta.items.length > 0 ? (
              <div style={{ marginBottom:8, borderBottom:'1px dashed #000', paddingBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>DETALLE</div>
                {ticketVenta.items.map((item: any) => (
                  <div key={item.id} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                    <span style={{ flex:1 }}>{item.nombre} x{item.cantidad}</span>
                    <span style={{ fontWeight:700 }}>{formatGs(item.precio_venta*item.cantidad)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom:8, borderBottom:'1px dashed #000', paddingBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                  <span style={{ fontWeight:600 }}>{ticketVenta.nombre_producto||'—'}</span>
                  <span style={{ fontWeight:700 }}>{formatGs(ticketVenta.total)}</span>
                </div>
              </div>
            )}
            <div style={{ marginBottom:10 }}>
              {ticketVenta.cliente_nombre && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                  <span style={{ color:'#444', fontWeight:600 }}>Cliente</span><span style={{ fontWeight:700 }}>{ticketVenta.cliente_nombre}</span>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                <span style={{ color:'#444', fontWeight:600 }}>Método</span><span style={{ fontWeight:700 }}>{ticketVenta.metodo_pago}</span>
              </div>
              {ticketVenta.descuento_gs > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                  <span style={{ fontWeight:600 }}>Descuento</span><span style={{ fontWeight:700 }}>-{formatGs(ticketVenta.descuento_gs)}</span>
                </div>
              )}
              {ticketVenta.monto_recibido > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                  <span style={{ fontWeight:600 }}>Recibido</span><span style={{ fontWeight:700 }}>{formatGs(ticketVenta.monto_recibido)}</span>
                </div>
              )}
              {ticketVenta.vuelto > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:3 }}>
                  <span style={{ fontWeight:700 }}>VUELTO</span><span style={{ fontWeight:900, fontSize:15 }}>{formatGs(ticketVenta.vuelto)}</span>
                </div>
              )}
              {ticketVenta.metodo_pago==='Cuotas' && ticketVenta.saldo_pendiente > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                  <span style={{ fontWeight:600 }}>Saldo pendiente</span><span style={{ fontWeight:700 }}>{formatGs(ticketVenta.saldo_pendiente)}</span>
                </div>
              )}
            </div>
            <div style={{ borderTop:'3px solid #000', paddingTop:8, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontSize:16, fontWeight:900 }}>TOTAL</span>
              <span style={{ fontSize:24, fontWeight:900 }}>{formatGs(ticketVenta.total)}</span>
            </div>
            <div style={{ textAlign:'center', fontSize:12, marginBottom:4, fontWeight:700 }}>¡Gracias por su compra!</div>
            <div style={{ textAlign:'center', fontSize:11, marginBottom:10, lineHeight:1.5 }}>
              Cambios hasta 48 hs con comprobante.<br />Producto y envoltorio en perfecto estado.
            </div>
            <div style={{ borderTop:'1px dashed #000', paddingTop:8, textAlign:'center', fontSize:11 }}>
              <div style={{ fontWeight:700 }}>Tel: {CONTACTO.tel}</div>
              <div>IG: @{CONTACTO.instagram} · FB: {CONTACTO.facebook}</div>
              <div>TikTok: @{CONTACTO.tiktok}</div>
            </div>
            <div className="no-print" style={{ display:'flex', gap:10, marginTop:14 }}>
              <button style={{ ...s.btnYellow, flex:1, justifyContent:'center' }} onClick={() => window.print()}>🖨 Imprimir</button>
              <button style={{ ...s.btnBlue, flex:1, justifyContent:'center' }} onClick={() => setTicketVenta(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ORDEN DE REPARACIÓN */}
      {ticketRep && (
        <div style={s.overlay} onClick={() => setTicketRep(null)}>
          <div className="print-area" onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:12, padding:'20px', width:'100%', maxWidth:380, color:'#000', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ textAlign:'center', marginBottom:10, borderBottom:'2px solid #000', paddingBottom:10 }}>
              <div style={{ fontSize:20, fontWeight:900, letterSpacing:2, fontFamily:'monospace' }}>NERY CELL</div>
              <div style={{ fontSize:14, fontWeight:700, marginTop:4 }}>ORDEN DE REPARACIÓN</div>
              <div style={{ fontSize:11 }}>Quiindy, Paraguarí · Tel: {CONTACTO.tel}</div>
            </div>
            <div style={{ textAlign:'center', fontSize:11, marginBottom:10, borderBottom:'1px dashed #000', paddingBottom:8 }}>
              Fecha ingreso: {formatFecha(ticketRep.fecha_ingreso || ticketRep.created_at)}
            </div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', marginBottom:6, borderBottom:'1px solid #000', paddingBottom:4 }}>DATOS DEL CLIENTE</div>
              {[['Nombre', ticketRep.cliente_nombre],['Teléfono', ticketRep.cliente_telefono],...(ticketRep.cliente_direccion?[['Dirección', ticketRep.cliente_direccion]]:[])].map(([k,v]) => (
                <div key={String(k)} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                  <span style={{ color:'#444', fontWeight:600 }}>{k}</span><span style={{ fontWeight:700 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:8, borderTop:'1px dashed #000', paddingTop:8 }}>
              <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', marginBottom:6, borderBottom:'1px solid #000', paddingBottom:4 }}>DATOS DEL EQUIPO</div>
              {[['Modelo', ticketRep.modelo_celular],['Problema', ticketRep.problema_reportado],['Técnico', ticketRep.tecnico]].map(([k,v]) => (
                <div key={String(k)} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                  <span style={{ color:'#444', fontWeight:600 }}>{k}</span><span style={{ fontWeight:700, textAlign:'right', maxWidth:'60%' }}>{v}</span>
                </div>
              ))}
              {ticketRep.observaciones && <div style={{ fontSize:11, marginTop:6, borderTop:'1px dashed #ccc', paddingTop:6 }}>Obs: {ticketRep.observaciones}</div>}
            </div>
            <div style={{ marginBottom:10, borderTop:'1px dashed #000', paddingTop:8 }}>
              <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', marginBottom:6, borderBottom:'1px solid #000', paddingBottom:4 }}>COSTO Y GARANTÍA</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:900, marginBottom:6 }}>
                <span>Costo estimado</span><span>{ticketRep.costo_estimado ? formatGs(ticketRep.costo_estimado) : 'A confirmar'}</span>
              </div>
              <div style={{ fontSize:12, fontWeight:600 }}>Garantía: {ticketRep.garantia||'Sin garantía'}</div>
              {(ticketRep.garantia?.includes('sin garantía')||ticketRep.garantia?.includes('económico')) && (
                <div style={{ fontSize:11, marginTop:4, fontStyle:'italic', fontWeight:600 }}>* Display económico. Sin garantía de fábrica.</div>
              )}
            </div>
            <div style={{ borderTop:'1px dashed #000', paddingTop:8, textAlign:'center', fontSize:11, lineHeight:1.6, marginBottom:12 }}>
              <div style={{ fontWeight:700 }}>Al retirar el equipo el cliente acepta las condiciones.</div>
              <div>Retirar dentro de los 30 días.</div>
              <div style={{ fontWeight:700 }}>Tel: {CONTACTO.tel} · IG: @{CONTACTO.instagram}</div>
            </div>
            <div className="no-print" style={{ display:'flex', gap:10 }}>
              <button style={{ ...s.btnYellow, flex:1, justifyContent:'center' }} onClick={() => window.print()}>🖨 Imprimir</button>
              <button style={{ ...s.btnBlue, flex:1, justifyContent:'center' }} onClick={() => setTicketRep(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}