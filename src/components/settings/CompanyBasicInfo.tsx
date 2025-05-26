
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanyBasicInfoProps {
  companyData: {
    name: string;
    document: string;
    address: string;
    phone: string;
    email: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CompanyBasicInfo: React.FC<CompanyBasicInfoProps> = ({
  companyData,
  onChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Empresa</Label>
          <Input
            id="name"
            name="name"
            value={companyData.name}
            onChange={onChange}
            placeholder="Nome da sua empresa"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">CNPJ</Label>
          <Input
            id="document"
            name="document"
            value={companyData.document}
            onChange={onChange}
            placeholder="00.000.000/0000-00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          name="address"
          value={companyData.address}
          onChange={onChange}
          placeholder="Endereço completo"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            value={companyData.phone}
            onChange={onChange}
            placeholder="(00) 0000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={companyData.email}
            onChange={onChange}
            placeholder="contato@suaempresa.com.br"
          />
        </div>
      </div>
    </>
  );
};
