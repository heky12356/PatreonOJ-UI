export const problems = [
    {
        id: 'P1000',
        title: 'A+B Problem',
        difficulty: '入门',
        historicalScores: '100%',
        problemNumber: '1000',
        description: '输入两个整数 a 和 b，输出它们的和。',
        notes: [
            'C/C++ 的 main 函数必须是 int 类型，而且 C 最后要 return 0。',
            '有负数哦！！'
        ],
        language: 'python',
        inputs: [
            { input: '30 50', output: '80' }
        ],
        tags: ['数学', '入门', '模拟'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1001', 'P1002']
    },
    {
        id: 'P1002',
        title: '整数乘法问题',
        difficulty: '入门',
        historicalScores: '100%',
        problemNumber: '1002',
        description: '给定两个整数 a 和 b，计算并输出它们的乘积。',
        notes: [
            '注意整数溢出问题（如果涉及大整数情况，不同语言处理方式不同）',
            '有负数参与乘法的情况要考虑'
        ],
        language: 'python',
        inputs: [
            { input: '4 6', output: '24' }
        ],
        tags: ['数学', '入门', '模拟'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1000', 'P1003']
    },
    {
        id: 'P1003',
        title: '整数除法问题',
        difficulty: '入门',
        historicalScores: '100%',
        problemNumber: '1003',
        description: '输入两个整数 a 和 b（b 不为 0），输出 a 除以 b 的商。',
        notes: [
            '注意 b 不能为 0 的情况处理，要添加输入校验提示',
            '整数除法结果取整方式（如 Python 中是向下取整，C++ 等根据正负有不同处理）'
        ],
        language: 'python',
        inputs: [
            { input: '15 3', output: '5' }
        ],
        tags: ['数学', '入门', '模拟'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1002', 'P1004']
    },
    {
        id: 'P1004',
        title: '求余数问题',
        difficulty: '入门',
        historicalScores: '100%',
        problemNumber: '1004',
        description: '输入两个整数 a 和 b（b 不为 0），输出 a 除以 b 的余数。',
        notes: [
            '同样要处理 b 为 0 的非法输入情况',
            '余数的符号规则（如 Python 中余数符号和除数一致等特性）'
        ],
        language: 'python',
        inputs: [
            { input: '17 5', output: '2' }
        ],
        tags: ['数学', '入门', '模拟'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1003', 'P1005']
    },
    {
        id: 'P1005',
        title: '两数平方和问题',
        difficulty: '入门',
        historicalScores: '100%',
        problemNumber: '1005',
        description: '输入两个整数 a 和 b，计算并输出 a 的平方与 b 的平方的和。',
        notes: [
            '注意整数平方后可能的溢出问题',
            '不同语言对大整数平方的处理差异'
        ],
        language: 'python',
        inputs: [
            { input: '3 4', output: '25' }
        ],
        tags: ['数学', '入门', '模拟'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1004', 'P1006']
    },
    {
        id: 'P1006',
        title: '输出整数本身',
        difficulty: '入门',
        historicalScores: '100%',
        problemNumber: '1006',
        description: '输入一个整数 n，直接输出该整数。',
        notes: [
            '注意处理不同进制输入情况（虽然题目说输入整数，也要考虑是否有异常输入）',
            '大整数的显示和处理'
        ],
        language: 'python',
        inputs: [
            { input: '123', output: '123' }
        ],
        tags: ['数学', '入门'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1005', 'P1007']
    },
    {
        id: 'P1007',
        title: '判断奇偶',
        difficulty: '入门',
        historicalScores: '100%',
        problemNumber: '1007',
        description: '输入一个整数，若为偶数输出“even”，若为奇数输出“odd”。',
        notes: [
            '注意 0 是偶数的情况判断',
            '负数的奇偶性判断（和正数规则一致，看能否被 2 整除）'
        ],
        language: 'python',
        inputs: [
            { input: '7', output: 'odd' }
        ],
        tags: ['数学', '入门'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1006', 'P1008']
    },
    {
        id: 'P1008',
        title: '三个数的平均数',
        difficulty: '简单',
        historicalScores: '100%',
        problemNumber: '1008',
        description: '输入三个整数，计算它们的平均数（保留一位小数）。',
        notes: [
            '浮点数精度问题，不同语言保留小数位的实现方式',
            '输入数据的范围和可能的溢出情况'
        ],
        language: 'python',
        inputs: [
            { input: '4 6 8', output: '6.0' }
        ],
        tags: ['数学', '简单'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1007', 'P1009']
    },
    {
        id: 'P1009',
        title: '判断闰年',
        difficulty: '简单',
        historicalScores: '100%',
        problemNumber: '1009',
        description: '输入一个年份，判断是否为闰年（能被4整除且不能被100整除，或能被400整除），是则输出“yes”，否则输出“no”。',
        notes: [
            '严格按照闰年规则判断，注意整百年份必须能被 400 整除才是闰年',
            '输入年份的范围（如负数年份的特殊情况处理）'
        ],
        language: 'python',
        inputs: [
            { input: '2020', output: 'yes' }
        ],
        tags: ['数学', '简单'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1008', 'P1010']
    },
    {
        id: 'P1010',
        title: '斐波那契数列第n项',
        difficulty: '中等',
        historicalScores: '100%',
        problemNumber: '1010',
        description: '输入正整数 n（n≤30），输出斐波那契数列的第n项（数列定义：F(1)=1，F(2)=1，F(n)=F(n-1)+F(n-2)）。',
        notes: [
            '递归实现可能存在的栈溢出问题（对于较大 n 建议用迭代方式）',
            '输入 n 的范围校验（确保 n 是正整数且≤30）'
        ],
        language: 'python',
        inputs: [
            { input: '6', output: '8' }
        ],
        tags: ['数学', '中等', '递归'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1009', 'P1011']
    },
    {
        id: 'P1011',
        title: '最大子数组和',
        difficulty: '困难',
        historicalScores: '100%',
        problemNumber: '1011',
        description: '输入一个整数数组（元素可正可负），找出其中连续子数组的最大和。',
        notes: [
            '经典的动态规划问题，理解状态转移方程',
            '处理全为负数的数组情况（最大和就是最大的那个负数）'
        ],
        language: 'python',
        inputs: [
            { input: "-2 1 -3 4 -1 2 1 -5 4", output: "6" }
        ],
        tags: ['算法', '困难', '动态规划'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1010', 'P1012']
    },
    {
        id: 'P1012',
        title: '字符串最长回文子串',
        difficulty: '困难',
        historicalScores: '100%',
        problemNumber: '1012',
        description: '输入一个字符串，输出其中最长的回文子串（回文是指正向和反向读都相同的字符串）。',
        notes: [
            '可以用中心扩展法、动态规划或 Manacher 算法等实现',
            '处理字符串长度为 0 或 1 的特殊情况'
        ],
        language: 'python',
        inputs: [
            { input: 'babad', output: 'bab' }
        ],
        tags: ['算法', '困难', '字符串'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1011', 'P1050']
    },
    {
        id: 'P1050',
        title: '两数交换',
        difficulty: '简单',
        historicalScores: '100%',
        problemNumber: '1050',
        description: '输入两个整数 a 和 b，输出交换后的 a 和 b（用空格分隔）。',
        notes: [
            '可以用临时变量、异或或 Python 特有的交换方式实现',
            '处理输入数据的类型和范围'
        ],
        language: 'python',
        inputs: [
            { input: '5 9', output: '9 5' }
        ],
        tags: ['数学', '简单', '入门'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1012', 'P1051']
    },
    {
        id: 'P1051',
        title: '求最大公约数',
        difficulty: '中等',
        historicalScores: '100%',
        problemNumber: '1051',
        description: '输入两个正整数，输出它们的最大公约数（用辗转相除法实现）。',
        notes: [
            '辗转相除法的原理和递归、迭代实现方式',
            '处理输入为 0 的特殊情况（题目说正整数，也要考虑健壮性）'
        ],
        language: 'python',
        inputs: [
            { input: '24 18', output: '6' }
        ],
        tags: ['数学', '中等', '算法'],
        discussions: '暂无讨论',
        recommendedProblems: ['P1050']
    }
];