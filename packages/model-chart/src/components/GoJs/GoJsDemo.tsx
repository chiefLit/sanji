import * as go from 'gojs'
import { useEffect, useRef } from 'react';

interface GoJsDemoProps {

}

const GoJsDemo: React.FC<GoJsDemoProps> = (props) => {
  const { } = props
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // divRef.current && go.Diagram.fromDiv(divRef.current)
    if (!divRef.current) return
    const myDiagram = go.Diagram.fromDiv(divRef.current)
    myDiagram.nodeTemplate =
      new go.Node("Auto")
        .add(new go.Shape("RoundedRectangle",
          { strokeWidth: 0, fill: "white" })
          .bind("fill", "color"))
        .add(new go.TextBlock({ margin: 8, stroke: "#333" })
          .bind("text", "key"));

    myDiagram.model = new go.GraphLinksModel(
      [
        { key: "Alpha", color: "lightblue" },
        { key: "Beta", color: "orange" },
        { key: "Gamma", color: "lightgreen" },
        { key: "Delta", color: "pink" }
      ],
      [
        { from: "Alpha", to: "Beta" },
        { from: "Alpha", to: "Gamma" },
        { from: "Beta", to: "Beta" },
        { from: "Gamma", to: "Delta" },
        { from: "Delta", to: "Alpha" }
      ]);
  }, [divRef])

  return (
    <div ref={divRef}>
    </div>
  );
}

export { GoJsDemo };