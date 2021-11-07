import React, { useEffect, useState } from 'react'
import useGlobalState from '../utils/useGlobalState'
import { useParams } from "react-router-dom";
const pkg = require('../../package.json')

function GridEditor(props) {
    const globalState = useGlobalState()
    const [dimensions, setDimensions] = useState([10, 10])
    const [dimensionsFrozen, setDimensionsFrozen] = useState(false)
    const [solutions, setSolutions] = useState([])
    const [selectedBlock, setSelectedBlock] = useState(null)
    const [title, setTitle] = useState('')
    const [pub, setPub] = useState(false)
    const [def, setDef] = useState([[], []])
    const { username, api_token } = globalState.user
    const {uid: gridId} = useParams();


    const loadGrid = async (id) => {
        try {
            const r = await fetch(process.env.REACT_APP_API_URL+'/grid/'+id, {
                method: 'GET',
                credentials: 'omit',
                headers: {
                    'Authorization': 'Token ' + api_token,
                    'Content-Type': 'application/json'
                }
            })
            const d = await r.json()
            setDimensions([d.width, d.height])
            setTitle(d.title)
            const a = []
            for (let j=0; j< d.height; j++){
                a.push([])
                for (let i=0; i< d.width; i++){
                    const ch = d.solution[j*d.width+i]
                    a[j].push(ch === '_' ? '': ch.toUpperCase())
                }
            }
            setSolutions(a)
            setDef(d.definitions)
            setPub(d.published)
            setDimensionsFrozen(true)
        } catch(e) {
            window.location = '/'
        }
    }

    useEffect(()=>{
        if (gridId) {
            (async () => (await loadGrid(gridId)))()
        }
            
    }, [gridId])

    const onChangeWidth = (ev) => {
        setDimensions([ev.target.value, dimensions[1]])
    }

    const onChangeHeight = (ev) => {
        setDimensions([dimensions[0], ev.target.value])
    }

    const freezeDimensions = () => {
        setDimensionsFrozen(true)
        
        const arr = []
        const arr2 = [[], []]
        for (let i=0; i < dimensions[1]; i++) {
            arr.push([])
            arr2[0].push('')
            for (let j=0; j < dimensions[0]; j++) {
                arr[i].push('')
            }
        }
        for (let j=0; j < dimensions[0]; j++) {
            arr2[1].push('')
        }
        setSolutions(arr)
        setDef(arr2)
    }
   
    const selectBlock = (i, j) => {
        setSelectedBlock([i, j])
    }

    const setSolutionXY = (i, j, e) => {
        e.preventDefault()
        const char = e.key.toLowerCase()
        if (char.length === 1 && /[a-z -]/.test(char)){
            const newSol = solutions;
            newSol[i][j] = char.toUpperCase()
            setSolutions(newSol)
            setSelectedBlock(null);
            document.activeElement.blur();
        }
        if(char === 'backspace'){
            const newSol = solutions;
            newSol[i][j] = ''
            setSolutions(newSol)
            setSelectedBlock(null);
            document.activeElement.blur();
        }
    }

    const setHorizontalDef = (i, txt) => {
        const tmp = def
        tmp[0][i] = txt
        setDef(tmp)
    }

    const setVerticalDef = (i, txt) => {
        const tmp = def
        tmp[1][i] = txt
        setDef(tmp)
    }

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

    const save = async () => {
        try {
            const url = process.env.REACT_APP_API_URL + '/grid/' + (gridId ? gridId : 'new')
            const response = await fetch(url, {
                method: gridId ? 'PUT' : 'POST',
                credentials: 'omit',
                headers: {
                    'Authorization': 'Token ' + api_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    width: dimensions[0],
                    height: dimensions[1],
                    title: !!title ? title : 'Grille sans titre',
                    solution: solutions.map(l=>l.map(c=> (c==='' ? '_' : (c === ' ' ? '#' : c.toLowerCase()))).join('')).join(''),
                    definitions: def,
                    published: pub ? (!solutions.map(l=>l.map(c=> (c==='' ? '_' : (c === ' ' ? '#' : c.toLowerCase()))).join('')).join('').includes('_')) : false
                })
            })
            if (response.status===200 || response.status===201) {
                const res = await response.json();
                window.location = `/grille/${res.id}/modifier`
            } else {
                throw new Error('not ok status')
            }
        } catch (e) {
            alert('Une erreur est survenue...')
        }
    }

    const publish = async () => {
        await fetch(process.env.REACT_APP_API_URL+'/grid/'+gridId, {
            method: 'PUT',
            credentials: 'omit',
            headers: {
                'Authorization': 'Token ' + api_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                width: dimensions[0],
                height: dimensions[1],
                title: title !== '' ? title : 'Grille sans titre',
                solution: solutions.map(l=>l.map(c=> (c === ' ' ? '#' : c.toLowerCase())).join('')).join(''),
                definitions: def,
                published: true
            })
        })
        window.location = '/grille/' + gridId
    }
    const deleteG = async () => {
        await fetch(process.env.REACT_APP_API_URL+'/grid/'+gridId, {
            method: 'DELETE',
            credentials: 'omit',
            headers: {
                'Authorization': 'Token ' + api_token,
                'Content-Type': 'application/json'
            },
        })
        window.location = '/'
    }

    const isGridFull = () => {
        return solutions.map(l=>l.map(c=> c).join('')).join('').length === dimensions[0]*dimensions[1]
    }
    return (
        <div className="container main-container">
            <h1>{gridId ? 'Editeur de grille':'Nouvelle grille'} </h1>
            
            {!dimensionsFrozen && (<>
                <h3>Dimensions</h3>
                <label for="width">Largeur</label>
                <input name="width" type="number" min="1" onChange={onChangeWidth} defaultValue={dimensions[0]}></input>
                <label for="height">Hauteur</label>
                <input name="height" type="number" min="1" onChange={onChangeHeight} defaultValue={dimensions[1]}></input>
                <button class="btn btn-primary" onClick={freezeDimensions}>Continuer</button>
            </>)}
            {dimensionsFrozen && (<><label>Titre: </label><input type='text' onChange={(e)=>setTitle(e.target.value)} placeholder="Titre de la grille" defaultValue={title}></input> {pub && <span class="badge bg-danger">publié</span>}<table>
                <tr><td> </td>{solutions[0].map((val, j)=>(<td style={{textAlign: 'center'}}>{romanize(j+1)}.</td>))}</tr>
                { solutions.map((line, i)=>(
                    <tr><td>{i+1}.</td>{line.map((val, j)=>(<td style={{width: '2em', height: '2em', border: '1px solid #000'}}><input type='text' onFocus={() => selectBlock(i, j)} onBlur={() => selectBlock(null)} style={{outline: 'none', textAlign: 'center', border: '0', caretColor: 'transparent', width: '2em', backgroundColor: ((selectedBlock && (selectedBlock[0] === i && selectedBlock[1] === j)) ? 'red' : (val === ' ' ? 'black' : 'white'))}} onKeyDown={(e) => setSolutionXY(i, j, e)} defaultValue={solutions[i][j] ? val : ''}/></td>))}</tr>
                ))
                }
                </table>
                <p>Cliquer sur une case et taper la lettre désiré, Espace pour noircire la case, Retour arrière pour re-initialiser la case.</p>
                <div style={{marginTop: '15px'}}>
                    <button class="btn btn-primary save-btn" onClick={save}>Sauvegarder</button>
                </div>
                <h3>Définitions</h3>
                <h4>Horizontalement</h4>
                <div>
                {solutions.map((l, i) => (
                    <div style={{margin: '5px'}}><span style={{width: '3em', display: 'inline-block'}}>{i+1}. </span><input  style={{width: '500px'}} type="text"  onChange={(e) => setHorizontalDef(i, e.target.value)} defaultValue={def[0][i]}></input></div>
                ))}
                </div>
                <h4>Verticalement</h4>
                <div>
                {solutions[0].map((l, i) => (
                    <div style={{margin: '5px'}}><span style={{width: '3em', display: 'inline-block'}}>{romanize(i+1)}. </span><input style={{width: '500px'}} type="text" onChange={(e) => setVerticalDef(i, e.target.value)} defaultValue={def[1][i]}></input></div>
                ))}
                </div>
                <div style={{marginTop: '15px'}}>
                    <button class="btn btn-primary save-btn" onClick={save}>Sauvegarder</button>
                </div>
                <div style={{marginTop: '15px'}}>
                    <button class="btn btn-danger" onClick={deleteG}>Supprimer</button>
                </div>
                {isGridFull() && gridId && <div style={{marginTop: '15px'}}>
                    <button class="btn btn-success" onClick={publish}>Publier</button>
                </div>}
                </>)
            }
        </div>
    )
}

export default GridEditor