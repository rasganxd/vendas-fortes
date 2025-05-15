
import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SalesRep } from '@/types';
import { useSalesReps } from '@/hooks/useSalesReps';
import { EditSalesRepDialog } from '@/components/personnel/EditSalesRepDialog';
import { DeleteSalesRepDialog } from '@/components/personnel/DeleteSalesRepDialog';
import MobileSyncStatus from '@/components/personnel/MobileSyncStatus';
import { Plus, Edit, Trash, Smartphone } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SalesRepsPage = () => {
  const { salesReps, addSalesRep, updateSalesRep, generateNextCode, isLoading, setSalesReps } = useSalesReps();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSalesRep, setSelectedSalesRep] = useState<SalesRep | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSalesRep, setNewSalesRep] = useState<Omit<SalesRep, 'id'>>({
    code: generateNextCode(),
    name: '',
    email: '',
    phone: '',
    document: '',
    notes: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'sales',
    active: true
  });
  
  // Initialize new sales rep with default values
  const initialSalesRep: Omit<SalesRep, 'id'> = {
    code: salesReps.length > 0 ? salesReps.reduce((max, sr) => Math.max(max, sr.code || 0), 0) + 1 : 1,
    name: '',
    email: '',
    phone: '',
    document: '',
    notes: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'sales',
    active: true
  };
  
  const handleCreate = async () => {
    try {
      await addSalesRep(newSalesRep);
      setOpenCreate(false);
      setNewSalesRep(initialSalesRep); // Reset the form
      toast({
        title: "Representante de vendas criado",
        description: "Representante de vendas criado com sucesso!",
      })
    } catch (error) {
      console.error("Error creating sales rep:", error);
      toast({
        title: "Erro ao criar representante de vendas",
        description: "Houve um problema ao criar o representante de vendas.",
        variant: "destructive",
      })
    }
  };

  const handleUpdate = async () => {
    if (!selectedSalesRep) return;
    
    try {
      await updateSalesRep(selectedSalesRep.id, selectedSalesRep);
      setOpenEdit(false);
      toast({
        title: "Representante de vendas atualizado",
        description: "Representante de vendas atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Error updating sales rep:", error);
      toast({
        title: "Erro ao atualizar representante de vendas",
        description: "Houve um problema ao atualizar o representante de vendas.",
        variant: "destructive",
      });
    }
  };

  const filteredSalesReps = salesReps.filter(rep => 
    rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.code?.toString().includes(searchTerm)
  );

  return (
    <PageLayout title="Representantes de Vendas">
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Vendedores</TabsTrigger>
          {selectedSalesRep && <TabsTrigger value="mobile-sync">Sincronização Mobile</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="list">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-1/3">
              <Input
                placeholder="Buscar vendedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            <Button onClick={() => setOpenCreate(true)} className="bg-sales-800 hover:bg-sales-700">
              <Plus size={16} className="mr-2" />
              Adicionar
            </Button>
          </div>
          
          <Table>
            <TableCaption>Lista de representantes de vendas.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSalesReps.map((salesRep) => (
                <TableRow key={salesRep.id}>
                  <TableCell className="font-medium">{salesRep.code}</TableCell>
                  <TableCell>{salesRep.name}</TableCell>
                  <TableCell>{salesRep.email}</TableCell>
                  <TableCell>{salesRep.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSalesRep(salesRep);
                      }}
                    >
                      <Smartphone size={16} className="mr-2" />
                      Mobile
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSalesRep(salesRep);
                        setOpenEdit(true);
                      }}
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSalesRep(salesRep);
                        setOpenDelete(true);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={16} className="mr-2" />
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSalesReps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {searchTerm ? "Nenhum representante encontrado para essa busca." : "Nenhum representante de vendas encontrado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="mobile-sync">
          {selectedSalesRep && <MobileSyncStatus salesRepId={selectedSalesRep.id} />}
        </TabsContent>
      </Tabs>

      {/* Create SalesRep Dialog */}
      <EditSalesRepDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        salesRep={newSalesRep}
        setSalesRep={setNewSalesRep}
        onSave={handleCreate}
        title="Criar Representante de Vendas"
      />

      {/* Edit SalesRep Dialog */}
      {selectedSalesRep && (
        <EditSalesRepDialog
          open={openEdit}
          onOpenChange={setOpenEdit}
          salesRep={selectedSalesRep}
          setSalesRep={setSelectedSalesRep}
          onSave={handleUpdate}
          title="Editar Representante de Vendas"
        />
      )}

      {/* Delete SalesRep Dialog */}
      {selectedSalesRep && (
        <DeleteSalesRepDialog
          open={openDelete}
          onOpenChange={setOpenDelete}
          salesRep={selectedSalesRep}
          setSalesReps={setSalesReps}
        />
      )}
    </PageLayout>
  );
};

export default SalesRepsPage;
