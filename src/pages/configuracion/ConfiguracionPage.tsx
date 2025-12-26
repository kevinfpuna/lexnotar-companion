import { useState } from 'react';
import { 
  User, 
  Building2, 
  Bell, 
  Database,
  Shield,
  Download,
  Upload,
  Save,
  Users,
  Briefcase,
  Columns,
  FolderOpen
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
import { TiposClienteTab } from '@/components/configuracion/TiposClienteTab';
import { TiposTrabajoTab } from '@/components/configuracion/TiposTrabajoTab';
import { EstadosKanbanTab } from '@/components/configuracion/EstadosKanbanTab';
import { CategoriasTrabajoTab } from '@/components/configuracion/CategoriasTrabajoTab';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { ThemeSelector } from '@/components/theme/ThemeSelector';

export default function ConfiguracionPage() {
  const [profesional, setProfesional] = useState(profesionalMock);
  const [usarIva, setUsarIva] = useState(true);
  const [tasaIva, setTasaIva] = useState('10');
  const [diasAlerta, setDiasAlerta] = useState('7');

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
  } = useTipos();

  const {
    categorias,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    toggleCategoriaActivo,
    reorderCategorias,
  } = useCategorias();

  const handleSave = () => {
    toast.success('Configuración guardada correctamente');
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

      <Tabs defaultValue="categorias" className="w-full">
        <TabsList className="flex-wrap h-auto gap-1 w-full justify-start">
          <TabsTrigger value="categorias" className="gap-1.5">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Categorías</span>
          </TabsTrigger>
          <TabsTrigger value="tipos-cliente" className="gap-1.5">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Tipos Cliente</span>
          </TabsTrigger>
          <TabsTrigger value="tipos-trabajo" className="gap-1.5">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Tipos Trabajo</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="gap-1.5">
            <Columns className="h-4 w-4" />
            <span className="hidden sm:inline">Estados Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="perfil" className="gap-1.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="negocio" className="gap-1.5">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Negocio</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="gap-1.5">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="respaldo" className="gap-1.5">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Respaldo</span>
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="gap-1.5">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        {/* Categorías de Trabajo */}
        <TabsContent value="categorias" className="mt-6">
          <CategoriasTrabajoTab
            categorias={categorias}
            onAdd={addCategoria}
            onUpdate={updateCategoria}
            onDelete={deleteCategoria}
            onToggleActivo={toggleCategoriaActivo}
            onReorder={reorderCategorias}
          />
        </TabsContent>

        {/* Tipos de Cliente */}
        <TabsContent value="tipos-cliente" className="mt-6">
          <TiposClienteTab
            tiposCliente={tiposCliente}
            onAdd={addTipoCliente}
            onUpdate={updateTipoCliente}
            onToggleActivo={toggleTipoClienteActivo}
            onDelete={deleteTipoCliente}
          />
        </TabsContent>

        {/* Tipos de Trabajo */}
        <TabsContent value="tipos-trabajo" className="mt-6">
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

        {/* Estados Kanban */}
        <TabsContent value="kanban" className="mt-6">
          <EstadosKanbanTab
            estadosKanban={estadosKanban}
            onAdd={addEstadoKanban}
            onUpdate={updateEstadoKanban}
            onDelete={deleteEstadoKanban}
            onReorder={reorderEstadosKanban}
          />
        </TabsContent>

        {/* Perfil */}
        <TabsContent value="perfil" className="mt-6">
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

        {/* Negocio */}
        <TabsContent value="negocio" className="mt-6 space-y-6">
          <ThemeSelector />
          
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
            </div>
          </Card>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notificaciones" className="mt-6 space-y-6">
          <NotificationSettings />

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Configuración de Alertas</h3>
            
            <div className="space-y-6">
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

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Recordatorios de trabajos pendientes</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar trabajos próximos a vencer al iniciar
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de deudas</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar sobre clientes con deudas antiguas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Respaldo */}
        <TabsContent value="respaldo" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Respaldo de Datos</h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  Exporta todos tus datos para tener un respaldo de seguridad. 
                  Puedes restaurarlos en cualquier momento.
                </p>
                
                <div className="flex gap-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar datos
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar datos
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Último respaldo</h4>
                <p className="text-sm text-muted-foreground">
                  No hay respaldos recientes
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="seguridad" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Seguridad de la Cuenta</h3>
            
            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="password-actual">Contraseña actual</Label>
                <Input id="password-actual" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-nueva">Nueva contraseña</Label>
                <Input id="password-nueva" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-confirmar">Confirmar nueva contraseña</Label>
                <Input id="password-confirmar" type="password" />
              </div>
              
              <Button>
                Cambiar contraseña
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
