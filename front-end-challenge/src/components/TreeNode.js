import React, { useState } from 'react';

// Componente TreeNode
const TreeNode = ({ node }) => {
  const [isOpen, setIsOpen] = useState(false); // Para controlar a expansão do nó

  const toggleOpen = () => {
    setIsOpen(!isOpen); // Alternar entre expandir e colapsar
  };

  return (
    <div style={{ marginLeft: '20px' }}>
      {/* Botão para expandir ou colapsar o nó */}
      <div onClick={toggleOpen} style={{ cursor: 'pointer' }}>
        {isOpen ? '[-]' : '[+]'} {node.name} {node.sensorType && `(${node.sensorType})`}
      </div>
      {/* Renderizar filhos se o nó estiver aberto */}
      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} /> // Renderiza recursivamente os filhos
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
