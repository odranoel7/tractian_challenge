import React, { useEffect, useState } from 'react';
import TreeNode from './TreeNode';
import './AssetTree.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import exportIcon from '../assets/icons/exportIcon.png';
import 'typeface-inter';
import iconComponent from '../assets/icons/component.png';

const AssetTree = ({companyId}) => {
  const [data, setData]                                     = useState([]);
  const [filteredData, setFilteredData]                     = useState([]);
  const [searchTerm, setSearchTerm]                         = useState('');
  const [isEnergyFilterActive, setIsEnergyFilterActive]     = useState(false);
  const [isCriticalFilterActive, setIsCriticalFilterActive] = useState(false);
  const [lastClickedNode, setLastClickedNode]               = useState(null);

  const unitNames = {
    '662fd0ee639069143a8fc387': 'Jaguar Unit',
    '662fd0fab3fd5656edb39af5': 'Tobias Unit',
    '662fd100f990557384756e58': 'Apex Unit'
  };

  let unitName = unitNames[companyId] || 'Unidade Desconhecida';

  useEffect(() => {
    if (!companyId) return; // Não faz a requisição se nenhum ID for passado

    const fetchData = async () => {
      let locationsResponse = await fetch(`https://fake-api.tractian.com/companies/${companyId}/locations`);
      locationsResponse = await locationsResponse.json();
      locationsResponse = sortLocations(locationsResponse);

      let assetsResult = await fetch(`https://fake-api.tractian.com/companies/${companyId}/assets`);
      assetsResult = await assetsResult.json();
      assetsResult = sortLocations(assetsResult);

      const locationTree = buildTree(locationsResponse);
      const treeWithAssets = integrateAssets(locationTree, assetsResult);

      setData(treeWithAssets);
      setFilteredData(treeWithAssets);
    };

    fetchData();
  }, [companyId]);

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

  const clickTeste = (node) => {
    alert('clicou rs')
  };

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', marginLeft: '10px'}}>
          <div>
            <label style={{fontFamily: 'Inter', fontWeight: '700', fontSize: '20px'}}>Ativos</label>
            &nbsp;
            <label style={{fontFamily: 'Inter', fontWeight: '200', fontSize: '15px'}}>/ {unitName}</label>
          </div>
  
          <div style={{ marginRight: '10px', display: 'flex', gap: '10px' }}>
            <button onClick={isEnergyFilterActive ? clearEnergyFilter : handleFilterByEnergy} className='btn-filter'>
              <i className="fas fa-bolt" style={{ marginRight: '5px', color: '#2188ff'}}></i>
              {isEnergyFilterActive ? 'Limpar Sensor de Energia' : 'Sensor de Energia'}
            </button>
  
            <button onClick={isCriticalFilterActive ? clearCriticalFilter : handleFilterByCritical} className='btn-filter'>
              <i className="fas fa-info-circle" style={{ marginRight: '5px', color: '#2188ff'}}></i>
              {isCriticalFilterActive ? 'Limpar Crítico' : 'Crítico'}
            </button>
          </div>
        </div>
      </div>

      <div style={{display: 'flex'}}>
        <div className="asset-tree-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginLeft: '-10px', marginTop: '-10px', marginRight: '-10px'}}>
            <input
              type="text"
              placeholder="Buscar Ativo ou Local"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px', width: '100%', border: '1px solid rgba(0, 0, 0, 0.1)' }}
            />
          </div>
    
          <div style={{ marginLeft: '10px'}}>
            
            {filteredData.length > 0 ? (
              filteredData.map(node => (
                <TreeNode key={node.id} node={node} onClick={() => clickTeste(node)}/>
              ))
            ) : (
              <p>Nenhum ativo encontrado.</p>
            )}
          </div>
        </div>


        

        <div className="body-container">
          
            <div id="containerBlock" style={{display: 'none'}}>
              <div style={{margin: '-10px', paddingBottom: '10px', border: '1px solid rgba(0, 0, 0, 0.1)', height: 'auto'}}>
                <label id="componentName" style={{fontFamily: 'Inter', fontSize: '18px', marginLeft: '20px', fontWeight: '600'}}>
                  
                </label>
              </div>

              <div style={{display: 'flex', marginTop: '30px', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{ width: '336px', height: '226px', backgroundColor: '#f2f8ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '5px' }}>
                  <img src={exportIcon} alt="Export Icon" style={{ width: '42px', height: '42px'}} />
                  <p style={{ textAlign: 'center', margin: 0, color: '#2188ff' }}>
                    Adicionar imagem do ativo
                  </p>
                </div>

                <div style={{marginLeft: '15px', width: '100%', marginRight: '20px'}}>
                  <label style={{fontFamily: 'Inter', display: 'block', fontWeight: 600, fontSize: '16px'}}>
                    Tipo de Equipamento
                  </label>

                  <label id='equipamentType' style={{display: 'block', marginTop: '10px', fontWeight: 400, fontFamily: 'Inter', fontSize: '16px'}}>
                    
                  </label>

                  <div style={{height: '1px', width: '100%', backgroundColor: '#E3EAEF', marginTop: '20px'}}></div>

                  <label style={{display: 'block', marginTop: '20px', fontWeight: 600, fontFamily: 'Inter', fontSize: '16px'}}>
                    Responsáveis
                  </label>

                  <label id='responsible' style={{display: 'block', marginTop: '10px', fontWeight: 400, fontFamily: 'Inter', fontSize: '16px'}}>
                    
                  </label>

                </div>
              </div>

              <div style={{height: '1px', width: '98%', backgroundColor: '#E3EAEF', marginTop: '30px'}}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '60%', alignItems: 'flex-start', marginTop: '40px'}}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontFamily: 'Inter', fontSize: '16px' }}>
                    Sensor
                  </label>

                  <label id='sensor' style={{ display: 'block', marginTop: '10px', fontWeight: 400, fontFamily: 'Inter', fontSize: '16px' }}>
                    
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontFamily: 'Inter', fontSize: '16px' }}>
                    Receptor
                  </label>

                  <label id='gateway' style={{ display: 'block', marginTop: '10px', fontWeight: 400, fontFamily: 'Inter', fontSize: '16px' }}>
                    
                  </label>
                </div>
              </div>
            </div>
          
        </div>
      </div>
    </div>
  );
};

export default AssetTree;
