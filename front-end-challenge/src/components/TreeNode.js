import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import iconAsset from '../assets/icons/asset.png';
import iconComponent from '../assets/icons/component.png';
import iconLocation from '../assets/icons/location.png';
import { useRef } from 'react';

const TreeNode = ({ node, onSelect, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);


  const toggleOpen = (node) => {
    const elements = document.getElementsByClassName('node-block');

    for (let i = 0; i < elements.length; i++) {
      elements[i].style.backgroundColor = '#FFFFFF';
      elements[i].style.color = '#202236';
    }



    document.getElementById('componentName').setHTMLUnsafe(node.name ? node.name : '');
    document.getElementById('equipamentType').setHTMLUnsafe('');
    document.getElementById('responsible').setHTMLUnsafe('');
    document.getElementById('sensor').setHTMLUnsafe('');
    document.getElementById('gateway').setHTMLUnsafe('');

    if (Object.keys(node).length == 4) {
      document.getElementById('containerBlock').style.display = 'none';
    } else if (node.children && node.children.length > 0)  {
      document.getElementById('containerBlock').style.display = 'none';
    } else {
      document.getElementById('containerBlock').style.display = 'block';

      document.getElementById('componentName').setHTMLUnsafe(node.name ? node.name : '-');
      document.getElementById('equipamentType').setHTMLUnsafe(node.sensorType ? node.sensorType : '-');
      document.getElementById('responsible').setHTMLUnsafe(node.sensorType ? node.sensorType : '-');
      document.getElementById('sensor').setHTMLUnsafe(node.sensorId ? node.sensorId : '-');
      document.getElementById('gateway').setHTMLUnsafe(node.gateway ? node.gateway : '-');
      
      document.getElementById(node.id).style.backgroundColor = '#2188ff';
      document.getElementById(node.id).style.color = '#FFFFFF';

    }

    setIsOpen(!isOpen);
  };

  const getIcon = (node) => {
    // console.log(Object.keys(node).length)
    if (Object.keys(node).length == 4) {
      return iconLocation;
    } else if (node.children && node.children.length > 0)  {
      return iconAsset;
    } else {
      return iconComponent;
    }
  };

  const hasArrow = (node) => {
    // console.log(Object.keys(node).length)
    if (Object.keys(node).length == 4) {
      return true;
    } else if (node.children && node.children.length > 0)  {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div id={node.id} class='node-block'>
      <div
        onClick={() => toggleOpen(node)}
        style={{
          marginLeft: `${level * 20}px`,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{display: hasArrow(node) ? 'flex' : 'none', marginRight: '5px' }}>
          {node.children && (isOpen ? <FaChevronDown /> : <FaChevronRight />)}
        </div>

        <img
          src={getIcon(node)}
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
