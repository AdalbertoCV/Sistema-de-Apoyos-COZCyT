import PropTypes from 'prop-types';
import { Helmet, HelmetProvider } from 'react-helmet-async';

PaginaHead.propTypes = {
  children: PropTypes.node
};
export function PaginaHead ({ children }){
  return (
    <HelmetProvider>      
        <Helmet>
          { children }                          
        </Helmet>            
    </HelmetProvider>       
  );
}

