import { useEffect, useState } from "react"
import {useParams} from 'react-router-dom'
import { getTestCasesByProblemNumber, addTestCase, apideleteTestCase } from "../../api/test_case_api"

const AddTestPage = ({problem_number, setIsAdd}) => {

    const [inputValue1, setInputValue1] = useState('')
    const [inputValue2, setInputValue2] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            console.log('Input 1 值:', inputValue1)
            console.log('Input 2 值:', inputValue2)
            const resp = await addTestCase({
                input: inputValue1,
                expected_output: inputValue2,
                problem_number
            })
            console.log(resp)
            // 提交成功后关闭表单
            setIsAdd(false)
            // 清空输入框
            setInputValue1('')
            setInputValue2('')
        } catch (error) {
            console.error('提交失败:', error)
        }
    }

    const handleCancel = () => {
        setIsAdd(false)
    }

    return (
        <>
            <div>添加测试用例表单</div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="input1" className="form-label">input</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="input1"
                        value={inputValue1}
                        onChange={(e) => setInputValue1(e.target.value)}
                        placeholder="请输入input"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="input2" className="form-label">expected_output</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="input2"
                        value={inputValue2}
                        onChange={(e) => setInputValue2(e.target.value)}
                        placeholder="请输入expected_output"
                    />
                </div>
                <button type="submit" className="btn btn-primary me-2">提交</button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>取消</button>
            </form>
        </>
    )
}

export default function ManageTestCasePage() {
    const {problem_number} = useParams()
    const [testCases, setTestCases] = useState({})
    const [testCasesDetail, setTestCasesDetail] = useState([])
    const [isadd, setIsAdd] = useState(false)
    const [isdelete, setIsDelete] = useState('')

    const handleAddClick = () => {
        setIsAdd(true)
    }

    const deleteTestCase = async (id) => {
        try {
            await apideleteTestCase({id : parseInt(id)})
            setIsDelete(id)
        } catch (error) {
            console.error('删除测试用例失败:', error)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getTestCasesByProblemNumber(problem_number)
                setTestCases(data)
                setTestCasesDetail(data.result)
            } catch (error) {
                console.error('获取测试用例失败:', error)
            }
        }
        
        if (problem_number) {
            fetchData()
        }
    },[problem_number, isadd, isdelete])

    return (
        <>
            <div>当前题目： {problem_number}</div>
            <div>测试用例数量： {testCases.count}</div>

            <div>测试用例列表：</div>
            {testCasesDetail?.map((testCase) => (
                <div key={testCase.id}>
                    <div>input: {testCase.Input}</div>
                    <div>expected_output: {testCase.ExpectedOutput}</div>
                    <button onClick={() => deleteTestCase(testCase.ID)}>删除</button>
                </div>
            ))}

            <button onClick={handleAddClick}>点击添加测试用例</button>
            {isadd && <AddTestPage problem_number={problem_number} setIsAdd={setIsAdd} />}

        </>
    )
}