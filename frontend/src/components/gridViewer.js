import React, { useEffect, useState } from 'react'
import useGlobalState from '../utils/useGlobalState'
import { useParams } from "react-router-dom";
import { useReactToPrint } from 'react-to-print';
const pkg = require('../../package.json')


function GridEditor() {
    const globalState = useGlobalState()
    const [solutions, setSolutions] = useState([])
    const [title, setTitle] = useState('')
    const [def, setDef] = useState([[], []])
    const { username, api_token } = globalState.user
    const {uid: gridId} = useParams();
    const componentRef = React.useRef();
    const print = useReactToPrint({
      content: () => componentRef.current,
    });

    const loadGrid = async (id) => {
        try {
            const r = await fetch(process.env.REACT_APP_API_URL+'/grid/'+id)
            const d = await r.json()
            setTitle(d.title)
            const a = []
            for (let j=0; j< d.height; j++){
                a.push([])
                for (let i=0; i< d.width; i++){
                    const ch = d.grid[j*d.width+i]
                    a[j].push(ch === '_' ? '': ch.toUpperCase())
                }
            }
            setSolutions(a)
            setDef(d.definitions)
        } catch(e) {
            window.location = '/'
        }
    }

    useEffect(()=>{
        if (gridId) {
            (async () => (await loadGrid(gridId)))()
        }
            
    }, [gridId])


    const romanize = (num) => {
        if (isNaN(num))
            return NaN;
        var digits = String(+num).split(""),
            key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
                   "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
                   "","I","II","III","IV","V","VI","VII","VIII","IX"],
            roman = "",
            i = 3;
        while (i--)
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;
        return Array(+digits.join("") + 1).join("M") + roman;
    }

    return (
        <div className="container main-container">
            { !!solutions.length && (<div ref={componentRef} style={{margin:'15px'}}><h1>{title}</h1><table>
                <tr><td> </td>{solutions[0].map((val, j)=>(<td style={{textAlign: 'center'}}>{romanize(j+1)}.</td>))}</tr>
                { solutions.map((line, i)=>(
                    <tr><td>{i+1}.</td>{line.map((val, j)=>(<td style={{width: '2em', height: '2em', border: '1px solid #000', backgroundColor: (val === ' ' ? 'black' : 'white')}}><span style={{textAlign: 'center'}}>{solutions[i][j] ? val : ''}</span></td>))}</tr>
                ))
                }
                </table>
                <p>Cliquer sur une case et taper la lettre désiré, Retour arrière pour re-initialiser la case.</p>
                <h3>Définitions</h3>
                <h4>Horizontalement</h4>
                <div>
                {def[0].map((l, i) => (
                    <div style={{margin: '5px'}}><span style={{width: '3em', display: 'inline-block'}}>{i+1}. </span><span>{l}</span></div>
                ))}
                </div>
                <h4>Verticalement</h4>
                <div>
                {def[1].map((l, i) => (
                    <div style={{margin: '5px'}}><span style={{width: '3em', display: 'inline-block'}}>{romanize(i+1)}. </span><span>{l}</span></div>
                ))}
                </div>
                </div>)
            }
            <button class="btn btn-primary" onClick={print}>Imprimer</button>
        </div>
    )
}

export default GridEditor