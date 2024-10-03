import React, { useEffect, useState } from 'react';
import TreeNode from './TreeNode';

const AssetTree = () => {
  const [data, setData] = useState([]); // Dados completos da árvore
  const [filteredData, setFilteredData] = useState([]); // Dados filtrados
  const [searchTerm, setSearchTerm] = useState(''); // Armazenar o termo de busca
  const [isEnergyFilterActive, setIsEnergyFilterActive] = useState(false); // Estado do filtro de energia
  const [isCriticalFilterActive, setIsCriticalFilterActive] = useState(false); // Estado do filtro de energia

  useEffect(() => {
    const fetchData = async () => {
      let locationsResponse = await fetch('https://fake-api.tractian.com/companies/662fd0ee639069143a8fc387/locations');
      locationsResponse = await locationsResponse.json();
      locationsResponse = sortLocations(locationsResponse);

      let assetsResult = await fetch('https://fake-api.tractian.com/companies/662fd0ee639069143a8fc387/assets');
      assetsResult = await assetsResult.json();
      assetsResult = sortLocations(assetsResult);

      const locationTree = buildTree(locationsResponse);
      const treeWithAssets = integrateAssets(locationTree, assetsResult);

      setData(treeWithAssets);
      setFilteredData(treeWithAssets);
    };

    fetchData();
  }, []);

  const buildTree = (nodes) => {
    const map = {};
    const roots = [];

    nodes.forEach(node => {
      map[node.id] = { ...node, children: [] };
    });

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

  const integrateAssets = (locationsTree, assets) => {
    const map = {};

    const buildMap = (nodes) => {
      nodes.forEach(node => {
        map[node.id] = node;
        if (!node.children) {
          node.children = [];
        }
        if (node.children) {
          buildMap(node.children);
        }
      });
    };

    buildMap(locationsTree);

    assets.forEach(asset => {
      const { id, locationId, parentId } = asset;

      if (locationId && map[locationId]) {
        map[locationId].children.push({ ...asset, children: [] });
      } else if (parentId && map[parentId]) {
        map[parentId].children.push({ ...asset, children: [] });
      } else if (!locationId && !parentId) {
        locationsTree.push({ ...asset, children: [] });
      } else {
        searchChildrens(map, parentId, { ...asset, children: [] });
      }
    });

    return locationsTree;
  };

  const searchChildrens = (obj, idToInsert, newChild) => {
    Object.values(obj).forEach(item => {
      if (item.id === idToInsert) {
        const exists = item.children.some(child => child.id === newChild.id);
        if (!exists) {
          item.children.push(newChild);
        }
      }

      if (item.children && item.children.length > 0) {
        searchChildrens(item.children, idToInsert, newChild);
      }
    });
  }

  const sortLocations = (array) => {
    const firstGroup = array.filter(item => item.locationId === null && item.parentId === null);
    const secondGroup = array.filter(item => item.locationId !== null && item.parentId === null);
    const thirdGroup = array.filter(item => 
        item.locationId === null && item.parentId !== null && 
        firstGroup.some(firstItem => firstItem.id === item.parentId) || 
        secondGroup.some(secondItem => secondItem.id === item.parentId)
    );
    const fourthGroup = array.filter(item => 
        !firstGroup.includes(item) && 
        !secondGroup.includes(item) && 
        !thirdGroup.includes(item)
    );

    return [...firstGroup, ...secondGroup, ...thirdGroup, ...fourthGroup];
  };

  const filterTree = (nodes, searchTerm) => {
    return nodes.reduce((acc, node) => {
      const matches = node.name.toLowerCase().includes(searchTerm.toLowerCase());
      const filteredChildren = filterTree(node.children || [], searchTerm);
      if (matches || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren,
        });
      }
      return acc;
    }, []);
  };

  const filterByEnergy = (nodes) => {
    return nodes.reduce((acc, node) => {
      const hasEnergySensor = node.sensorType === 'energy';
      const filteredChildren = filterByEnergy(node.children || []);

      if (hasEnergySensor || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren,
        });
      }
      return acc;
    }, []);
  };

  useEffect(() => {
    if (searchTerm) {
        setFilteredData(filterTree([...data], searchTerm));
    } else if (isEnergyFilterActive) {
        setFilteredData(filterByEnergy([...data]));
    } else if (isCriticalFilterActive) {
        setFilteredData(filterByCritical([...data]));
    } else {
        setFilteredData(data);
    }
}, [searchTerm, data, isEnergyFilterActive, isCriticalFilterActive]);

  const handleFilterByEnergy = () => {
    setIsEnergyFilterActive(true);
  };

  const clearEnergyFilter = () => {
    setIsEnergyFilterActive(false);
  };




  const filterByCritical = (nodes) => {
    return nodes.reduce((acc, node) => {
      const hasCriticalSensor = node.status === 'alert';
      const filteredChildren = filterByCritical(node.children || []);

      if (hasCriticalSensor || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren,
        });
      }
      return acc;
    }, []);
  };

  const handleFilterByCritical = () => {
    setIsCriticalFilterActive(true);
  };

  const clearCriticalFilter = () => {
    setIsCriticalFilterActive(false);
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <input 
          type="text"
          placeholder="Buscar Ativo ou Local"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', width: '70%', border: '1px solid #ccc' }}
        />
        
        <button onClick={isEnergyFilterActive ? clearEnergyFilter : handleFilterByEnergy} style={{ padding: '10px', marginLeft: '10px' }}>
          {isEnergyFilterActive ? 'Limpar Filtro de Energia' : 'Filtrar por Energia'}
        </button>

        <button onClick={isCriticalFilterActive ? clearCriticalFilter : handleFilterByCritical} style={{ padding: '10px', marginLeft: '-10px' }}>
          {isCriticalFilterActive ? 'Limpar Filtro Crítico' : 'Crítico'}
        </button>
      </div>


      <div style={{ width: '30%', borderRight: '1px solid #ccc' }}>
        <h2>Árvore de Ativos</h2>
        {filteredData.length > 0 ? (
          filteredData.map(node => (
            <TreeNode key={node.id} node={node} />
          ))
        ) : (
          <p>Nenhum ativo encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default AssetTree;
