// context/menu-layout-context.js
import { createContext, useContext } from '@wordpress/element';

export const MenuLayoutContext = createContext(null);

export const useMenuLayout = () => {
	return useContext(MenuLayoutContext);
};
