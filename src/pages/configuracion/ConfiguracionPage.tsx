import { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Shield,
  Download,
  Upload,
  Save,
  Settings,
  Layers,
  Trash2,
  Image
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
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTipos } from '@/hooks/useTipos';
import { useCategorias } from '@/hooks/useCategorias';
import { useTiposDocumento } from '@/hooks/useTiposDocumento';
import { useProfesional } from '@/hooks/useProfesional';
import { useConfiguracion } from '@/hooks/useConfiguracion';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { TiposClienteTab } from '@/components/configuracion/TiposClienteTab';
import { TiposTrabajoTab } from '@/components/configuracion/TiposTrabajoTab';
import { EstadosKanbanTab } from '@/components/configuracion/EstadosKanbanTab';
import { CategoriasTrabajoTab } from '@/components/configuracion/CategoriasTrabajoTab';
import { TiposDocumentoTab } from '@/components/configuracion/TiposDocumentoTab';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { PasswordStrengthIndicator } from '@/components/configuracion/PasswordStrengthIndicator';
import { exportBackup, importBackup } from '@/lib/backup';

export default function ConfiguracionPage() {
  const { 
    profesional, 
    updateProfesional, 
    uploadLogo, 
    uploadFirma, 
    deleteLogo, 
    deleteFirma 
  } = useProfesional();
  
  const { config, updateConfig, resetConfig } = useConfiguracion();
  
  const [formData, setFormData] = useState(profesional);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tiposSubTab, setTiposSubTab] = useState('categorias');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const firmaInputRef = useRef<HTMLInputElement>(null);

  // Sync formData when profesional changes
  useEffect(() => {
    setFormData(profesional);
  }, [profesional]);

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

  const handleSaveProfesional = () => {
    updateProfesional(formData);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo(file);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleFirmaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFirma(file);
    if (firmaInputRef.current) firmaInputRef.current.value = '';
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

        {/* TAB 1: TIPOS */}
        <TabsContent value="tipos" className="mt-6">
          <Card className="p-6">
            <Tabs value={tiposSubTab} onValueChange={setTiposSubTab}>
              <TabsList className="mb-6 flex-wrap h-auto">
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

        {/* TAB 2: PROFESIONAL */}
        <TabsContent value="profesional" className="mt-6 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Datos del Profesional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input 
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input 
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula de Identidad</Label>
                <Input 
                  id="cedula"
                  value={formData.cedula}
                  onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input 
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="domicilio">Domicilio</Label>
                <Input 
                  id="domicilio"
                  value={formData.domicilio}
                  onChange={(e) => setFormData({...formData, domicilio: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSaveProfesional}>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </Button>
            </div>
          </Card>

          {/* Logo */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Logo de la Oficina</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sube el logo de tu oficina para usar en presupuestos y documentos (máx. 2MB)
            </p>
            
            {profesional.logoBase64 ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/30 flex items-start gap-4">
                  <img 
                    src={profesional.logoBase64} 
                    alt="Logo" 
                    className="h-24 w-24 object-contain border rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{profesional.logoUrl}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Última actualización: {format(new Date(profesional.fechaActualizacion), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={deleteLogo}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cambiar logo
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => logoInputRef.current?.click()}
              >
                <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arrastra una imagen o haz clic para seleccionar
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir logo
                </Button>
              </div>
            )}
            
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </Card>

          {/* Firma Digital */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Firma Digital</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sube una imagen de tu firma para usar en documentos (máx. 2MB)
            </p>
            
            {profesional.firmaBase64 ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/30 flex items-start gap-4">
                  <img 
                    src={profesional.firmaBase64} 
                    alt="Firma" 
                    className="h-24 w-auto object-contain border rounded bg-white"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{profesional.firmaDigitalPath}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Última actualización: {format(new Date(profesional.fechaActualizacion), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={deleteFirma}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => firmaInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cambiar firma
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => firmaInputRef.current?.click()}
              >
                <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Sube tu firma para documentos PDF
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir firma
                </Button>
              </div>
            )}
            
            <input
              ref={firmaInputRef}
              type="file"
              accept="image/*"
              onChange={handleFirmaUpload}
              className="hidden"
            />
          </Card>
        </TabsContent>

        {/* TAB 3: GENERAL */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card className="p-6 space-y-6">
            {/* Facturación */}
            <div>
              <h3 className="font-semibold mb-4">Facturación</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Usar IVA en presupuestos</Label>
                    <p className="text-sm text-muted-foreground">
                      Incluir IVA automáticamente en presupuestos
                    </p>
                  </div>
                  <Switch
                    checked={config.usarIva}
                    onCheckedChange={(checked) => updateConfig({ usarIva: checked }, true)}
                  />
                </div>

                {config.usarIva && (
                  <div className="space-y-2 ml-4 pl-4 border-l-2">
                    <Label htmlFor="tasa-iva">Tasa de IVA (%)</Label>
                    <Input
                      id="tasa-iva"
                      type="number"
                      min="0"
                      max="100"
                      value={config.tasaIva}
                      onChange={(e) => updateConfig({ tasaIva: parseFloat(e.target.value) || 0 }, true)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Alertas */}
            <div>
              <h3 className="font-semibold mb-4">Alertas y Notificaciones</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dias-alerta">Días de anticipación para alertas</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar alertas X días antes de vencimientos
                  </p>
                  <Input
                    id="dias-alerta"
                    type="number"
                    min="1"
                    max="30"
                    value={config.diasAlerta}
                    onChange={(e) => updateConfig({ diasAlerta: parseInt(e.target.value) || 7 }, true)}
                    className="w-32"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Formato */}
            <div>
              <h3 className="font-semibold mb-4">Formato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda por defecto</Label>
                  <Select
                    value={config.monedaDefault}
                    onValueChange={(value) => updateConfig({ monedaDefault: value }, true)}
                  >
                    <SelectTrigger id="moneda">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PYG">PYG (Guaraníes)</SelectItem>
                      <SelectItem value="USD">USD (Dólares)</SelectItem>
                      <SelectItem value="EUR">EUR (Euros)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formato-fecha">Formato de fecha</Label>
                  <Select
                    value={config.formatoFecha}
                    onValueChange={(value) => updateConfig({ formatoFecha: value }, true)}
                  >
                    <SelectTrigger id="formato-fecha">
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
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => {
                if (confirm('¿Restablecer configuración a valores por defecto?')) {
                  resetConfig();
                }
              }}>
                Restablecer por defecto
              </Button>
            </div>
          </Card>

          <NotificationSettings />
        </TabsContent>

        {/* TAB 4: SISTEMA */}
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

        {/* TAB 5: SEGURIDAD */}
        <TabsContent value="seguridad" className="mt-6 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-full">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Cambiar Contraseña</h3>
                <p className="text-sm text-muted-foreground">
                  Actualiza tu contraseña para mantener tu cuenta segura
                </p>
              </div>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="password-actual">Contraseña actual</Label>
                <Input 
                  id="password-actual" 
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="password-nueva">Nueva contraseña</Label>
                <Input 
                  id="password-nueva" 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                />
                <PasswordStrengthIndicator password={newPassword} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-confirmar">Confirmar nueva contraseña</Label>
                <Input 
                  id="password-confirmar" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-destructive">Las contraseñas no coinciden</p>
                )}
                {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 8 && (
                  <p className="text-sm text-green-600">✓ Las contraseñas coinciden</p>
                )}
              </div>
              
              <Button 
                type="submit"
                disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 8}
              >
                <Shield className="h-4 w-4 mr-2" />
                Cambiar contraseña
              </Button>
            </form>
          </Card>

          {/* Info de seguridad */}
          <Card className="p-6">
            <h4 className="font-semibold mb-3">Recomendaciones de seguridad</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Usa una contraseña única que no uses en otros sitios
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Combina mayúsculas, minúsculas, números y símbolos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Cambia tu contraseña periódicamente (cada 3-6 meses)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                No compartas tu contraseña con nadie
              </li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
