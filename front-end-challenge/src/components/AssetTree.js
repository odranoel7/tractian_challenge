import React, { useEffect, useState } from 'react';
import TreeNode from './TreeNode';

const AssetTree = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Aqui você deve chamar a API para buscar os ativos e locais
      const response = await fetch('http://fake-api.tractian.com/companies/1/assets'); // Exemplo de chamada
      const result = await response.json();
      setData(result);
    };
    
    fetchData();
  }, []);

  return (
    <div>
      <h2>Árvore de Ativos</h2>
      {data.map(node => (
        <TreeNode key={node.id} node={node} /> // Renderiza cada nó
      ))}
    </div>
  );
};

export default AssetTree;
