import { useState, useRef } from 'react';
import { 
  User, 
  Building2, 
  Shield,
  Download,
  Upload,
  Save,
  Settings,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { profesionalMock } from '@/lib/mockData';
import { toast } from 'sonner';
import { useTipos } from '@/hooks/useTipos';
import { useCategorias } from '@/hooks/useCategorias';
import { useTiposDocumento } from '@/hooks/useTiposDocumento';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { TiposClienteTab } from '@/components/configuracion/TiposClienteTab';
import { TiposTrabajoTab } from '@/components/configuracion/TiposTrabajoTab';
import { EstadosKanbanTab } from '@/components/configuracion/EstadosKanbanTab';
import { CategoriasTrabajoTab } from '@/components/configuracion/CategoriasTrabajoTab';
import { TiposDocumentoTab } from '@/components/configuracion/TiposDocumentoTab';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { exportBackup, importBackup } from '@/lib/backup';

export default function ConfiguracionPage() {
  const [profesional, setProfesional] = useState(profesionalMock);
  const [usarIva, setUsarIva] = useState(true);
  const [tasaIva, setTasaIva] = useState('10');
  const [diasAlerta, setDiasAlerta] = useState('7');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tiposSubTab, setTiposSubTab] = useState('categorias');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { clientes, trabajos, items, pagos, eventos, documentos, setClientes, setTrabajos, setItems, setPagos, setEventos, setDocumentos } = useApp();
  const { cambiarPassword } = useAuth();

  const {
    tiposCliente,
    addTipoCliente,
    updateTipoCliente,
    toggleTipoClienteActivo,
    deleteTipoCliente,
    tiposTrabajo,
    addTipoTrabajo,
    updateTipoTrabajo,
    toggleTipoTrabajoActivo,
    deleteTipoTrabajo,
    cloneTipoTrabajo,
    estadosKanban,
    addEstadoKanban,
    updateEstadoKanban,
    deleteEstadoKanban,
    reorderEstadosKanban,
    setTiposCliente,
    setTiposTrabajo,
    setEstadosKanban,
  } = useTipos();

  const {
    categorias,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    toggleCategoriaActivo,
    reorderCategorias,
    setCategorias,
  } = useCategorias();

  const {
    tiposDocumento,
    addTipoDocumento,
    updateTipoDocumento,
    toggleTipoDocumentoActivo,
    deleteTipoDocumento,
    setTiposDocumento,
  } = useTiposDocumento();

  const handleSave = () => {
    toast.success('Configuración guardada correctamente');
  };

  const handleExport = () => {
    exportBackup({
      clientes,
      trabajos,
      items,
      pagos,
      eventos,
      documentos,
      tiposCliente,
      tiposTrabajo,
      categorias,
      estadosKanban,
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await importBackup(file, (backup) => {
      if (backup.clientes) setClientes(backup.clientes);
      if (backup.trabajos) setTrabajos(backup.trabajos);
      if (backup.items) setItems(backup.items);
      if (backup.pagos) setPagos(backup.pagos);
      if (backup.eventos) setEventos(backup.eventos);
      if (backup.tiposCliente) setTiposCliente(backup.tiposCliente);
      if (backup.tiposTrabajo) setTiposTrabajo(backup.tiposTrabajo);
      if (backup.categorias) setCategorias(backup.categorias);
      if (backup.estadosKanban) setEstadosKanban(backup.estadosKanban);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (cambiarPassword(oldPassword, newPassword)) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-1">
            Personaliza tu cuenta y preferencias del sistema
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Guardar cambios
        </Button>
      </div>

      <Tabs defaultValue="tipos" className="w-full">
        <TabsList className="flex-wrap h-auto gap-1 w-full justify-start">
          <TabsTrigger value="tipos" className="gap-1.5">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Tipos</span>
          </TabsTrigger>
          <TabsTrigger value="profesional" className="gap-1.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profesional</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-1.5">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-1.5">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="gap-1.5">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: TIPOS - Agrupa Categorías, Tipos Cliente, Tipos Trabajo, Estados Kanban, Tipos Documentos */}
        <TabsContent value="tipos" className="mt-6">
          <Card className="p-6">
            <Tabs value={tiposSubTab} onValueChange={setTiposSubTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="categorias">Categorías</TabsTrigger>
                <TabsTrigger value="tipos-cliente">Tipos Cliente</TabsTrigger>
                <TabsTrigger value="tipos-trabajo">Tipos Trabajo</TabsTrigger>
                <TabsTrigger value="estados-kanban">Estados Kanban</TabsTrigger>
                <TabsTrigger value="tipos-documento">Tipos Documento</TabsTrigger>
              </TabsList>

              <TabsContent value="categorias">
                <CategoriasTrabajoTab
                  categorias={categorias}
                  onAdd={addCategoria}
                  onUpdate={updateCategoria}
                  onDelete={deleteCategoria}
                  onToggleActivo={toggleCategoriaActivo}
                  onReorder={reorderCategorias}
                />
              </TabsContent>

              <TabsContent value="tipos-cliente">
                <TiposClienteTab
                  tiposCliente={tiposCliente}
                  onAdd={addTipoCliente}
                  onUpdate={updateTipoCliente}
                  onToggleActivo={toggleTipoClienteActivo}
                  onDelete={deleteTipoCliente}
                />
              </TabsContent>

              <TabsContent value="tipos-trabajo">
                <TiposTrabajoTab
                  tiposTrabajo={tiposTrabajo}
                  categorias={categorias}
                  onAdd={addTipoTrabajo}
                  onUpdate={updateTipoTrabajo}
                  onToggleActivo={toggleTipoTrabajoActivo}
                  onDelete={deleteTipoTrabajo}
                  onClone={cloneTipoTrabajo}
                />
              </TabsContent>

              <TabsContent value="estados-kanban">
                <EstadosKanbanTab
                  estadosKanban={estadosKanban}
                  onAdd={addEstadoKanban}
                  onUpdate={updateEstadoKanban}
                  onDelete={deleteEstadoKanban}
                  onReorder={reorderEstadosKanban}
                />
              </TabsContent>

              <TabsContent value="tipos-documento">
                <TiposDocumentoTab
                  tiposDocumento={tiposDocumento}
                  onAdd={addTipoDocumento}
                  onUpdate={updateTipoDocumento}
                  onToggleActivo={toggleTipoDocumentoActivo}
                  onDelete={deleteTipoDocumento}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </TabsContent>

        {/* TAB 2: PROFESIONAL - Datos del profesional, logo y firma */}
        <TabsContent value="profesional" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Datos del Profesional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input 
                  id="nombre"
                  value={profesional.nombre}
                  onChange={(e) => setProfesional({...profesional, nombre: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input 
                  id="apellido"
                  value={profesional.apellido}
                  onChange={(e) => setProfesional({...profesional, apellido: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula de Identidad</Label>
                <Input 
                  id="cedula"
                  value={profesional.cedula}
                  onChange={(e) => setProfesional({...profesional, cedula: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input 
                  id="telefono"
                  value={profesional.telefono}
                  onChange={(e) => setProfesional({...profesional, telefono: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={profesional.email}
                  onChange={(e) => setProfesional({...profesional, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="domicilio">Domicilio</Label>
                <Input 
                  id="domicilio"
                  value={profesional.domicilio}
                  onChange={(e) => setProfesional({...profesional, domicilio: e.target.value})}
                />
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="font-semibold mb-4">Logo y Firma</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Logo del Estudio</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra una imagen o haz clic para seleccionar
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Subir logo
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Firma Digital</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Sube tu firma para documentos PDF
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Subir firma
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: GENERAL - Negocio, moneda, IVA, alertas */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Configuración de Negocio</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda predeterminada</Label>
                  <Select value={profesional.monedaDefault}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PYG">Guaraníes (PYG)</SelectItem>
                      <SelectItem value="USD">Dólares (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="formato">Formato de fecha</Label>
                  <Select value={profesional.formatoFecha}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                      <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                      <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Usar IVA en presupuestos</Label>
                    <p className="text-sm text-muted-foreground">
                      Incluir IVA en los cálculos de presupuestos
                    </p>
                  </div>
                  <Switch checked={usarIva} onCheckedChange={setUsarIva} />
                </div>

                {usarIva && (
                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="tasa-iva">Tasa de IVA (%)</Label>
                    <Input 
                      id="tasa-iva"
                      type="number"
                      value={tasaIva}
                      onChange={(e) => setTasaIva(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="dias-alerta">Días para alertar vencimientos</Label>
                <Input 
                  id="dias-alerta"
                  type="number"
                  value={diasAlerta}
                  onChange={(e) => setDiasAlerta(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Mostrar alertas X días antes de un vencimiento
                </p>
              </div>
            </div>
          </Card>

          <NotificationSettings />
        </TabsContent>

        {/* TAB 4: SISTEMA - Tema, respaldo */}
        <TabsContent value="sistema" className="mt-6 space-y-6">
          <ThemeSelector />
          
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Respaldo de Datos</h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  Exporta todos tus datos para tener un respaldo de seguridad. 
                  Puedes restaurarlos en cualquier momento. Los archivos adjuntos no se incluyen para reducir el tamaño.
                </p>
                
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar datos
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar datos
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <h4 className="font-medium text-destructive mb-2">Advertencia</h4>
                <p className="text-sm text-muted-foreground">
                  Al importar un respaldo, <strong>todos los datos actuales serán reemplazados</strong>. 
                  Esta acción no se puede deshacer. Asegúrate de exportar tus datos actuales antes de importar.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 5: SEGURIDAD - Cambio de contraseña */}
        <TabsContent value="seguridad" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Cambiar Contraseña</h3>
            
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="password-actual">Contraseña actual</Label>
                <Input 
                  id="password-actual" 
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-nueva">Nueva contraseña</Label>
                <Input 
                  id="password-nueva" 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-confirmar">Confirmar nueva contraseña</Label>
                <Input 
                  id="password-confirmar" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={4}
                />
              </div>
              
              <Button type="submit">
                Cambiar contraseña
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
