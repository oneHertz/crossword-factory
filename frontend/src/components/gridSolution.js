import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { useReactToPrint } from 'react-to-print';

function GridSolution(props) {
    const [solutions, setSolutions] = useState(null)
    const {uid: gridId, solutionHash} = useParams();
    const componentRef = React.useRef();

    const print = useReactToPrint({
        content: () => componentRef.current,
    });

    const loadGrid = async (id, solutionH) => {
        try {
            const r = await fetch(process.env.REACT_APP_API_URL+'/grid/'+id+'/check', {
                method: 'POST',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({hash: solutionH})
            })
            const d = await r.json()
            if (!d.is_ok) {
                throw Error('not valid hash')
            }
            const a = []
            for (let j=0; j< d.height; j++){
                a.push([])
                for (let i=0; i< d.width; i++){
                    const ch = d.solution[j*d.width+i]
                    a[j].push(ch === '_' ? '': ch.toUpperCase())
                }
            }
            setSolutions(a)
        } catch(e) {
            console.log(e)
            //window.location = '/'
        }
    }

    useEffect(()=>{
        if (gridId) {
            (async () => (await loadGrid(gridId, solutionHash)))()
        }  
    }, [gridId, solutionHash])

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
            <div ref={componentRef} style={{margin:'15px'}}><h1>Solution</h1>
            {solutions && (<table>
                <tr><td> </td>{solutions[0].map((val, j)=>(<td style={{textAlign: 'center'}}>{romanize(j+1)}.</td>))}</tr>
                { solutions.map((line, i)=>(
                    <tr><td>{i+1}.</td>{line.map((val, j)=>(<td className={'box ' + (val === ' ' ? 'blackBox': '')}>
                    {val !== ' ' && (
                    <input type='text' className='iBox' style={{outline: 'none', textAlign: 'center', border: '0', caretColor: 'transparent'}} value={solutions[i][j] ? val : ''} readOnly/>
                    )}
                </td>))}</tr>
                ))
                }
            </table>
            )}
            </div>
            <button className="btn btn-primary" onClick={print}>Imprimer</button>
        </div>
    )
}

export default GridSolution