import React, { useEffect, useState } from 'react';
import TreeNode from './TreeNode';

const AssetTree = () => {
  const [data, setData] = useState([]); // Dados completos da árvore
  const [filteredData, setFilteredData] = useState([]); // Dados filtrados
  const [searchTerm, setSearchTerm] = useState(''); // Armazenar o termo de busca

  useEffect(() => {
    // const fetchData = async () => {
    //   // Buscar os dados de 'locations'
    //   const locationsResponse = await fetch('http://fake-api.tractian.com/companies/662fd0ee639069143a8fc387/locations');
    //   const locationsResult = await locationsResponse.json();

    //   // Buscar os dados de 'assets'
    //   const assetsResponse = await fetch('http://fake-api.tractian.com/companies/662fd0ee639069143a8fc387/assets');
    //   const assetsResult = await assetsResponse.json();

    //   // Construir a árvore de 'locations'
    //   const locationTree = buildTree(locationsResult);

    //   // Integrar os 'assets' na árvore
    //   const treeWithAssets = integrateAssets(locationTree, assetsResult);

    //   setData(treeWithAssets); // Definir a estrutura de árvore com 'locations' e 'assets'
    //   setFilteredData(treeWithAssets); // Inicialmente, todos os dados são exibidos
    // };

    const fetchData = async () => {
      // Buscar os dados de 'locations'
      const locationsResponse = await fetch('http://fake-api.tractian.com/companies/662fd0ee639069143a8fc387/locations');
      const locationsResult = await locationsResponse.json();
    
      // Ordenar os locais: primeiro aqueles com parentId == null
      // const sortedLocations = locationsResult.sort((a, b) => {
      //   // Se a.parentId é null, deve vir antes
      //   if (a.parentId === null && b.parentId !== null) return -1;
      //   if (a.parentId !== null && b.parentId === null) return 1;
      //   return 0; // Mantém a ordem se ambos têm ou não têm parentId
      // });
    
      // Buscar os dados de 'assets'
      const assetsResponse = await fetch('http://fake-api.tractian.com/companies/662fd0ee639069143a8fc387/assets');
      const assetsResult = await assetsResponse.json();
    
      // Ordenar os ativos: primeiro aqueles com parentId == null
      const sortedAssets = assetsResult.sort((a, b) => {
        if (a.parentId === null && b.parentId !== null) return -1;
        if (a.parentId !== null && b.parentId === null) return 1;
        return 0; // Mantém a ordem se ambos têm ou não têm parentId
      });
    
      // Construir a árvore de 'locations'
      const locationTree = buildTree(locationsResult);
    
      // Integrar os 'assets' na árvore
      const treeWithAssets = integrateAssets(locationTree, sortedAssets);
    
      setData(treeWithAssets); // Definir a estrutura de árvore com 'locations' e 'assets'
      setFilteredData(treeWithAssets); // Inicialmente, todos os dados são exibidos
    };

    fetchData();
  }, []);

  // Função para transformar a lista plana de 'locations' em uma árvore hierárquica
  const buildTree = (nodes) => {
    const map = {};
    const roots = [];

    // Cria um mapa de nós para facilitar a pesquisa
    nodes.forEach(node => {
      map[node.id] = { ...node, children: [] };
    });

    // Itera sobre os nós e os organiza como filhos ou raízes
    nodes.forEach(node => {
      if (node.parentId) {
        if (map[node.parentId]) {
          map[node.parentId].children.push(map[node.id]);
        }
      } else {
        roots.push(map[node.id]);
      }
    });

    return roots;
  };

  // Função para integrar os 'assets' na árvore de 'locations'
  const integrateAssets = (locationsTree, assets) => {
    const map = {};

    // Criar um mapa de 'locations' e 'assets' para facilitar a pesquisa
    const buildMap = (nodes) => {
      nodes.forEach(node => {
        map[node.id] = node;
        if (node.children) {
          buildMap(node.children);
        }
      });
    };

    // Construir o mapa inicial com os 'locations'
    buildMap(locationsTree);


    // Iterar sobre os 'assets' e colocá-los no local correto
    assets.forEach(asset => {
      console.log(asset)
      if (asset.parentId && map[asset.parentId]) {
        // Se o asset tem um parentId, associar ao nó do parent asset
        map[asset.parentId].children.push({ ...asset, children: [] });
      } else if (asset.locationId && map[asset.locationId]) {
        // Se o asset tem um locationId, associar ao nó de 'location'
        map[asset.locationId].children.push({ ...asset, children: [] });
      } else {
        // Se não tem 'locationId' ou 'parentId', adiciona no topo da árvore
        locationsTree.push({ ...asset, children: [] });
      }
    });

    return locationsTree;
  };

  // Função recursiva para filtrar a árvore de ativos
  const filterTree = (nodes, searchTerm) => {
    return nodes.filter(node => {
      if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true; // Se o nome corresponde ao termo de busca
      }
      if (node.children) {
        // Se há filhos, filtrar recursivamente
        const filteredChildren = filterTree(node.children, searchTerm);
        if (filteredChildren.length > 0) {
          node.children = filteredChildren;
          return true;
        }
      }
      return false;
    });
  };

  // Atualizar os dados filtrados conforme o usuário digita
  useEffect(() => {
    if (searchTerm) {
      setFilteredData(filterTree([...data], searchTerm)); // Filtrar os dados com base no termo de busca
    } else {
      setFilteredData(data); // Se não houver termo de busca, exibir todos os dados
    }
  }, [searchTerm, data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <input 
        type="text"
        placeholder="Buscar Ativo ou Local"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Atualiza o termo de busca
        style={{ padding: '10px', marginBottom: '20px', width: '100%', border: '1px solid #ccc' }}
      />
      <div style={{ width: '30%', borderRight: '1px solid #ccc' }}>
        <h2>Árvore de Ativos</h2>
        {filteredData.length > 0 ? (
          filteredData.map(node => (
            <TreeNode key={node.id} node={node} /> // Renderiza os nós filtrados
          ))
        ) : (
          <p>Nenhum ativo encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default AssetTree;