
import { productCrud } from './product/productCrud';

export const productService = {
  getAll: productCrud.getAll,
  getById: productCrud.getById,
  create: productCrud.create,
  update: productCrud.update,
  delete: productCrud.delete
};
