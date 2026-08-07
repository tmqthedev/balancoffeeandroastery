import { generatePath } from 'react-router-dom';

export const PRODUCT_DETAIL_ROUTE = '/products/:id';

export const productDetailPath = (id) => generatePath(PRODUCT_DETAIL_ROUTE, { id });
