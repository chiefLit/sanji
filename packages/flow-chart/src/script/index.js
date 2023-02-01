const mapData = {
  startNode: { nodeKey: 1, preNodeKey: 'root', nextNodeKey: 2 },
  2: { nodeKey: 2, preNodeKey: 1, nextNodeKey: 6, conditionNodeKeys: [3, 4] },
  3: { nodeKey: 3, preNodeKey: 0, nextNodeKey: 0 },
  4: { nodeKey: 4, preNodeKey: 0, nextNodeKey: 5 },
  5: { nodeKey: 5, preNodeKey: 4, nextNodeKey: 0 },
  6: { nodeKey: 6, preNodeKey: 2, nextNodeKey: 0 },
}

function convert(mapData, flowKey) {
  const startNode = mapData[flowKey]
  if (startNode?.nextNodeKey) {
    startNode.nextNode = convert(mapData, startNode.nextNodeKey)
  }
  if (startNode.conditionNodeKeys && startNode.conditionNodeKeys.length) {
    startNode.conditionNodes = startNode.conditionNodeKeys.map(key => {
      return convert(mapData, key)
    })
  }

  return startNode
}

const res = convert(mapData, 'startNode')

console.log(JSON.stringify(res))