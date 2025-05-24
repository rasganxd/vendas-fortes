import { useState } from 'react';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SalesRep } from '@/types';
import { useSalesReps } from '@/hooks/useSalesReps';
import { EditSalesRepDialog } from '@/components/personnel/EditSalesRepDialog';
import { DeleteSalesRepDialog } from '@/components/personnel/DeleteSalesRepDialog';
import MobileSyncStatus from '@/components/personnel/MobileSyncStatus';
import { Plus, ExternalLink, Trash2, Smartphone, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
const SalesRepsPage = () => {
  const {
    salesReps,
    addSalesRep,
    updateSalesRep,
    generateNextCode,
    isLoading,
    setSalesReps,
    refreshSalesReps
  } = useSalesReps();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSalesRep, setSelectedSalesRep] = useState<SalesRep | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newSalesRep, setNewSalesRep] = useState<Omit<SalesRep, 'id'>>({
    code: generateNextCode(),
    name: '',
    phone: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    active: true
  });

  // Initialize new sales rep with default values
  const initialSalesRep: Omit<SalesRep, 'id'> = {
    code: salesReps.length > 0 ? salesReps.reduce((max, sr) => Math.max(max, sr.code || 0), 0) + 1 : 1,
    name: '',
    phone: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    active: true
  };
  const handleCreate = async () => {
    try {
      console.log("=== CREATING SALES REP FROM UI ===");
      console.log("New sales rep data:", newSalesRep);
      setIsCreating(true);
      const result = await addSalesRep(newSalesRep);
      console.log("Create result:", result);
      if (result) {
        setOpenCreate(false);
        setNewSalesRep({
          ...initialSalesRep,
          code: generateNextCode()
        }); // Reset with new code
        console.log("✅ Sales rep created successfully from UI");
      } else {
        console.error("❌ Create operation returned empty result");
      }
    } catch (error) {
      console.error("❌ Error in handleCreate:", error);
      toast({
        title: "❌ Erro ao criar representante de vendas",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  const handleUpdate = async () => {
    if (!selectedSalesRep) return;
    try {
      await updateSalesRep(selectedSalesRep.id, selectedSalesRep);
      setOpenEdit(false);
      toast({
        title: "✅ Representante de vendas atualizado",
        description: "Representante de vendas atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating sales rep:", error);
      toast({
        title: "❌ Erro ao atualizar representante de vendas",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };
  const handleOpenCreate = () => {
    const nextCode = generateNextCode();
    setNewSalesRep({
      ...initialSalesRep,
      code: nextCode
    });
    setOpenCreate(true);
  };

  // Improved filtering with robust null checks
  const filteredSalesReps = salesReps.filter(rep => {
    const nameMatch = rep.name ? rep.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const phoneMatch = rep.phone ? rep.phone.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const codeMatch = rep.code ? rep.code.toString().includes(searchTerm) : false;
    return nameMatch || phoneMatch || codeMatch;
  });
  if (isLoading) {
    return <PageLayout title="Representantes de Vendas">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>;
  }
  return <PageLayout title="Representantes de Vendas">
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Vendedores</TabsTrigger>
          {selectedSalesRep && <TabsTrigger value="mobile-sync">Sincronização Mobile</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="list">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-1/3">
              <Input placeholder="Buscar vendedores..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex gap-2">
              
              
              <Button onClick={handleOpenCreate} className="bg-sales-800 hover:bg-sales-700" disabled={isCreating}>
                {isCreating ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus size={16} className="mr-2" />}
                {isCreating ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </div>
          </div>
          
          <Table>
            <TableCaption>
              Total: {salesReps.length} representantes de vendas cadastrados.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSalesReps.map(salesRep => <TableRow key={salesRep.id}>
                  <TableCell className="font-medium">{salesRep.code || '—'}</TableCell>
                  <TableCell>{salesRep.name || '—'}</TableCell>
                  <TableCell>{salesRep.phone || '—'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${salesRep.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {salesRep.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedSalesRep(salesRep);
                }}>
                      <Smartphone size={16} className="mr-2" />
                      Mobile
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedSalesRep(salesRep);
                  setOpenEdit(true);
                }}>
                      <ExternalLink size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedSalesRep(salesRep);
                  setOpenDelete(true);
                }} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>)}
              {filteredSalesReps.length === 0 && <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchTerm ? "Nenhum representante encontrado para essa busca." : "Nenhum representante de vendas encontrado."}
                    {!searchTerm && <div className="mt-2">
                        <Button onClick={handleOpenCreate} variant="outline">
                          Adicionar primeiro vendedor
                        </Button>
                      </div>}
                  </TableCell>
                </TableRow>}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="mobile-sync">
          {selectedSalesRep && <MobileSyncStatus salesRepId={selectedSalesRep.id} />}
        </TabsContent>
      </Tabs>

      {/* Create SalesRep Dialog */}
      <EditSalesRepDialog open={openCreate} onOpenChange={setOpenCreate} salesRep={newSalesRep} setSalesRep={setNewSalesRep} onSave={handleCreate} title="Criar Representante de Vendas" />

      {/* Edit SalesRep Dialog */}
      {selectedSalesRep && <EditSalesRepDialog open={openEdit} onOpenChange={setOpenEdit} salesRep={selectedSalesRep} setSalesRep={setSelectedSalesRep} onSave={handleUpdate} title="Editar Representante de Vendas" />}

      {/* Delete SalesRep Dialog */}
      {selectedSalesRep && <DeleteSalesRepDialog open={openDelete} onOpenChange={setOpenDelete} salesRep={selectedSalesRep} setSalesReps={setSalesReps} />}
    </PageLayout>;
};
export default SalesRepsPage;