import React, { useEffect, useState } from 'react'

import { useParams } from "react-router-dom";
import { useReactToPrint } from 'react-to-print';
import ShareModal from './shareModal';

function GridEditor() {
    const [solutions, setSolutions] = useState([])
    const [title, setTitle] = useState('')
    const [selectedBlock, setSelectedBlock] = useState(null)
    const [writingDirection, setWritingDirection] = useState('h')
    const [minHighlight, setMinHighlight] = useState(null)
    const [maxHighlight, setMaxHighlight] = useState(null)
    const [def, setDef] = useState([[], []])
    const [author, setAuthor] = useState(null);
    const [sharedUrl, setSharedUrl] = useState();
    const {uid: gridId} = useParams();
    const componentRef = React.useRef();
    const aaa = React.useRef([]);
 
    const print = useReactToPrint({
      content: () => componentRef.current,
    });

    useEffect(()=>{

      const loadGrid = async (id) => {
        try {
            const r = await fetch(import.meta.env.VITE_API_URL+'/grid/'+id)
            const d = await r.json()
            setTitle(d.title)
            setAuthor(d.author)
            let savedGrid = ''
            const { hash } = window.location;
            const data = new URLSearchParams(hash.slice(1));
            try {
                window.location.hash = ""
                const solutionB64 = data.get('s');
                if (solutionB64) {
                    savedGrid = JSON.parse(atob(solutionB64)).map(l=>l.map(c=> (c==='' ? '_' : (c === ' ' ? '#' : c.toLowerCase()))).join('')).join('');
                }
                
            } catch(e) {console.log(e)}
            if (!savedGrid) {
                try {
                    savedGrid = JSON.parse(window.localStorage.getItem(gridId)).map(l=>l.map(c=> (c==='' ? '_' : (c === ' ' ? '#' : c.toLowerCase()))).join('')).join('');
                } catch(e) {}
            }
            const a = []
            for (let j=0; j< d.height; j++){
                a.push([])
                for (let i=0; i< d.width; i++){
                    const ch = d.grid[j*d.width+i]
                    if (savedGrid.length) {
                        const cha = ch === ' ' ? ch : savedGrid[j*d.width+i];
                        a[j].push(cha === '_' ? '' : cha.toUpperCase())
                    } else {
                        a[j].push(ch === '_' ? '': ch.toUpperCase())
                    }
                }
            }
            setSolutions(a)
            const defH = d.definitions[0].map(t=>t.replace('\n', ' ').replace('\r', ''))
            const defV = d.definitions[1].map(t=>t.replace('\n', ' ').replace('\r', ''))
            setDef([defH, defV])
        } catch(e) {
            window.location = '/'
        }
      }

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

    const selectNextBlock = (i, j) => {
        var wd = writingDirection
        var maxH = maxHighlight
        if (wd === 'h') {
            if (j + 1 < maxH) {
                selectBlock(i, j + 1)
            } else {
                selectBlock(null)
            }
        }
        if (wd === 'v') {
            if (i + 1 < maxH) {
                selectBlock(i + 1, j)
            } else {
                selectBlock(null)
            }
        }
    }

    React.useEffect(()=>{
        if(selectedBlock)
            aaa.current[selectedBlock[0]+'_'+selectedBlock[1]].focus()
    }, [selectedBlock])

    const switchWritingDir = (i, j) => {
        let wd = writingDirection
        if(selectedBlock && (selectedBlock[0] === i && selectedBlock[1] === j)) {
            if (wd === 'h') {
                wd = 'v'
            } else {
                wd = 'h'
            }
        } else  {
            wd = 'h'  
        }
        if (wd === 'h') {
            var minH = j
            while (minH >= 0 && solutions[i][minH] !== ' ') {
                minH -= 1
            }
            setMinHighlight(minH)
            var maxH = j
            while (maxH < solutions[0].length && solutions[i][maxH] !== ' ') {
                maxH += 1
            }
            setMaxHighlight(maxH)
        }
        if (wd === 'v') {
            var minV = i
            while (minV >= 0 && solutions[minV][j] !== ' ') {
                minV -= 1
            }
            setMinHighlight(minV)
            var maxV = i
            while (maxV < solutions.length && solutions[maxV][j] !== ' ') {
                maxV += 1
            }
            console.log(maxV)
            setMaxHighlight(maxV)
        }
        setWritingDirection(wd)
        
    }
    const selectBlock = (i, j) => {
        if (i === null) {
            setSelectedBlock(null)
            return
        }
        setSelectedBlock([i, j])
    }

    const setSolutionXY = (i, j, e) => {
        e.persist();
        e.preventDefault()
        const char = e.key.toLowerCase()
        if (!selectedBlock || (selectedBlock[0] !== i || selectedBlock[1] !== j)) {
            return
        }
        if (char.length === 1 && /[a-z-]/.test(char)){
            const newSol = solutions;
            newSol[i][j] = char.toUpperCase()
            e.target.value = char.toUpperCase()
            setSolutions(newSol)
            selectNextBlock(i, j)
            window.localStorage.setItem(gridId, JSON.stringify(newSol));
        }
        if(char === 'backspace' || e.keyCode === 8){
            const newSol = solutions;
            newSol[i][j] = ''
            e.target.value = ''
            setSolutions(newSol)
            selectBlock(i, j)
            window.localStorage.setItem(gridId, JSON.stringify(newSol));
        }
    }

    const onSquareChanged = (i, j, e)=>{
        const c = e.target.value ? e.target.value.toUpperCase()[e.target.value.length-1] : '';
        
        if(solutions[i][j] !== ' ' && c.length === 1 && /[A-Z-]/.test(c)){
            const newSol = solutions
            newSol[i][j] = c
            e.target.value = c
            setSolutions(newSol)
            selectNextBlock(i, j)
            window.localStorage.setItem(gridId, JSON.stringify(newSol));
        } else {
            e.target.value = ''
        }
    }

    let webShareApiAvailable = false
    if (navigator.canShare) {
      webShareApiAvailable = true
    }

    const [shareModalOpen, setShareModalOpen] = useState(false)
    const share = (url2share) => {
      if (!url2share) {
        console.log(document.location.href.toString())
        setSharedUrl(document.location.href.toString())
      } else {
        setSharedUrl(url2share)
      }
      if(webShareApiAvailable) {
        try {
          navigator.share({url: sharedUrl}).then(()=>{}).catch(()=>{});
        } catch (e) {}
      } else {
        setShareModalOpen(true)
      }
    }

    const isGridFull = () => {
        return solutions.map(l=>l.map(c=> c).join('')).join('').length === solutions.length*solutions[0].length
    }

    const copyState = async () => {
        const txt = JSON.stringify(solutions)
        let url2share = document.location.href;
        if (!url2share.endsWith("#")) {
            url2share += "#"
        }
        url2share += ("s=" + btoa(txt))
        share(url2share)
    }

    const checkSolution = async () => {
        const txt = solutions.map(l=>l.map(c=>c.toLowerCase()).join('')).join('')
        const solutionHash = btoa(String.fromCharCode(...new Uint8Array(await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt))))).replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_')
        try {
            const resp = await fetch(
                import.meta.env.VITE_API_URL + '/grid/' + gridId + '/check',
                {
                    method: 'POST',
                    credentials: 'omit',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({hash: solutionHash})
                }
            )
            if(resp.status === 200){
                const data = await resp.json()
                if (data.is_ok) {
                    alert('Bravo, votre solution est correcte!')
                } else {
                    alert('Desolé, votre solution est érronée!')
                }
            }
        } catch(e) {
            alert('Une erreur est survenue...')
        }
    }
    return (
        <div className="container main-container">
            { !!solutions.length && (<div ref={componentRef} style={{margin:'15px'}}><div className="mb-3"><h1 className="mb-0">{title}</h1><span style={{fontSize: "0.7em"}}>par {author.first_name} {author.last_name}</span></div><button onClick={()=>share()} className="btn btn-info inv mb-1">Partager la grille</button><br/><button className="btn btn-success inv mb-1" onClick={()=>copyState()}>Partager mes progrès</button><br/><table className="t mt-4"><tbody>
                <tr><td> </td>{solutions[0].map((val, j)=>(<td key={'colh' + j} style={{textAlign: 'center'}}>{romanize(j+1)}.</td>))}</tr>
                { solutions.map((line, i)=>(
                    <tr key={"line_" + i}><td>{i+1}.</td>{line.map((val, j)=>(<td key={i + ' ' + j} className={'box ' + (val === ' ' ? 'blackBox': '')}>
                        {val !== ' ' && (
                        <input type='text' id={'square_'+i+'_'+j} onMouseDown={()=>{switchWritingDir(i, j);selectBlock(i, j)}} className='iBox' ref={(input) => { aaa.current[i+'_'+j] = input }}  style={{outline: 'none', textAlign: 'center', border: '0', caretColor: 'transparent', backgroundColor: ((selectedBlock && (selectedBlock[0] === i && selectedBlock[1] === j)) ? 'red' : ((selectedBlock && ((writingDirection === 'h' && i === selectedBlock[0] && j > minHighlight && j < maxHighlight)||(writingDirection === 'v' && j === selectedBlock[1] && i > minHighlight && i < maxHighlight)))?'#f99':(val === ' ' ? 'black' : 'white')))}} onKeyDown={(e) => setSolutionXY(i, j, e)} defaultValue={solutions[i][j] ? val : ''} onChange={(e) => onSquareChanged(i, j, e)}/>
                        )}
                    </td>))}</tr>
                ))
                }
                </tbody></table>
                <p className='inv'>Cliquez sur une case et tapez la lettre désirée, Retour arrière pour ré-initialiser la case.</p>
                {isGridFull() && <p><button className="btn btn-secondary inv" onClick={checkSolution}>Verifier votre solution</button></p>}
                <div className='d'>
                <h3>Définitions</h3>
                <div className="row">
                    <div className="col-12 col-md-6" style={{borderRight: '1px solid #000'}}>
                        <h4>Horizontalement</h4>
                        <div>
                        {def[0].map((l, i) => (
                            <div key={"hdef" + i} style={{margin: '5px'}}><span style={{width: '3em', display: 'inline-block'}}>{i+1}. </span><span style={(selectedBlock && writingDirection === 'h' && i === selectedBlock[0]) ? {color: 'red', fontWeight: 'bold'} : {}}>{l}</span></div>
                        ))}
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <h4>Verticalement</h4>
                        <div>
                        {def[1].map((l, i) => (
                            <div key={"vdef" + i} style={{margin: '5px'}}><span style={{width: '3em', display: 'inline-block'}}>{romanize(i+1)}. </span><span style={(selectedBlock && writingDirection === 'v' && i === selectedBlock[1]) ? {color: 'red', fontWeight: 'bold'} : {}}>{l}</span></div>
                        ))}
                        </div>
                    </div>
                </div>
                </div>
            </div>)
            }
            <button className="btn btn-primary mb-1" onClick={print}>Imprimer</button>
            {shareModalOpen && <ShareModal url={sharedUrl} onClose={()=>setShareModalOpen(false)}/> }
        </div>
    )
}

export default GridEditor