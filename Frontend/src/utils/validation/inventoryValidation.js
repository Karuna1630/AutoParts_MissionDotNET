import * as Yup from 'yup';

export const inventorySchema = Yup.object().shape({
  sku: Yup.string()
    .required('SKU Code is required')
    .min(3, 'SKU must be at least 3 characters'),
  name: Yup.string()
    .required('Item Name is required')
    .min(2, 'Name must be at least 2 characters'),
  category: Yup.string()
    .required('Category is required'),
  vendor: Yup.string()
    .required('Vendor is required'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be greater than 0')
    .typeError('Price must be a number'),
  stock: Yup.number()
    .required('Stock Quantity is required')
    .min(0, 'Stock cannot be negative')
    .integer('Stock must be an integer')
    .typeError('Stock must be a number'),
});
