const Web3 = require('web3');
const express = require('express');
var Tx = require('ethereumjs-tx');
var app = express()

var url = 'https://ropsten.infura.io/v3/452e791b87004800bfd544280e414290';

// const web3 = new Web3(new Web3.providers.HttpProvider(url));
const web3 = new Web3(url);
const account1 = '0xf7d2b9f1313dd8a47c56cffc833602e766dd39ae';

const privateKey = process.env.PRIVATE_KEY_1;

const privateKey1 = Buffer.from(privateKey, 'hex');

web3.eth.defaultAccount =  account1

const ABI = [{"constant":false,"inputs":[{"name":"_fName","type":"string"},{"name":"_age","type":"uint256"}],"name":"setInstructor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"name","type":"string"},{"indexed":false,"name":"age","type":"uint256"}],"name":"Instructor","type":"event"},{"constant":true,"inputs":[],"name":"getInstructor","outputs":[{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
const contractAddr = '0x8f7306f378757ff8032b4122a4c2a9e3e17acff7'

const contract = new web3.eth.Contract(ABI, contractAddr)
app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	next();
})
app.get('/set/:name/:age', (req, res) => {
	const name = req.params.name
	const age = req.params.age
	setInstructorName(name, parseInt(age), res)
});

app.get('/fetchData', async (req, res) => {
	var response = await getInstructorDatas()
	res.send(response);
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

function setInstructorName(name, age, res) {
	web3.eth.getTransactionCount(account1, (err, txCount) => {

		const txObject = {
			nonce:    web3.utils.toHex(txCount),
			gasLimit: web3.utils.toHex(800000), // Raise the gas limit to a much higher amount
			gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
			to: contractAddr,
			data: contract.methods.setInstructor(name, web3.utils.toHex(age)).encodeABI()
		}
	
		const tx = new Tx(txObject)
		tx.sign(privateKey1)
	
		const serializedTx = tx.serialize()
		const raw = '0x' + serializedTx.toString('hex')
		
		web3.eth.sendSignedTransaction(raw, async (err, txHash) => {
			console.log('err:', err, 'txHash:', txHash)
			const result = await getInstructorDatas();
			console.log(result.datas.length)
			const lastRecord = result.datas[result.datas.length - 1]
			res.send(lastRecord)
			// Use this txHash to find the contract on Etherscan!
		})
	});
}

async function getInstructorDatas() {
	var responseData;
	await contract.getPastEvents('Instructor', { fromBlock: 0, toBlock: 'latest'}, (err, events) => {
		var response = {}
		var data = []
		for (x in events) {
			data.push({
				name: events[x].returnValues.name,
				age: events[x].returnValues.age.toString(),
				txHash: events[x].transactionHash
			});
			response.datas = data
		}
		responseData = response
	});
	return responseData
}

app.listen(8085, () => {
	console.log('Web3 in 8080');
})
