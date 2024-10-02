import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import iconAsset from '../assets/icons/asset.png';
import iconComponent from '../assets/icons/component.png';
import iconLocation from '../assets/icons/location.png';

const TreeNode = ({ node, onSelect, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const getIcon = (sensorType) => {
    
    switch (sensorType) {
      // case 'asset':
      //   return iconAsset;
      // case 'component':
      //   return iconComponent;
      // case 'location':
      //   return iconLocation;
      default:
        return iconLocation; // Ícone padrão
    }
  };

  return (
    <div>
      <div
        onClick={toggleOpen}
        style={{
          marginLeft: `${level * 20}px`, // Aplicando deslocamento com base no nível
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{ marginRight: '5px' }}>
          {node.children && (isOpen ? <FaChevronDown /> : <FaChevronRight />)}
        </div>

        <img
          src={getIcon(node.sensorType)}
          alt={node.sensorType}
          style={{
            width: '20px',
            height: '20px',
            marginRight: '10px',
            marginLeft: '5px',
            marginTop: '4px',
          }}
        />

        {node.name}
      </div>

      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} onSelect={onSelect} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
