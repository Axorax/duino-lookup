const commentsLoad = document.querySelector('.comments-accordin-load');

document.querySelector('.accordion-comments').addEventListener('click', () => {
    const commentsInterval = setInterval(() => {
        if (document.querySelector('.utterances-frame')) {
            commentsLoad.style.display = 'none';
            clearInterval(commentsInterval);
        } else {
            console.log('%cLoading Comments, Status: X', 'color:red')
        }
    }, 1000)
}, {
    once: true
});

const search = document.querySelector('.search'),
    info = document.querySelector('.info'),
    loader = document.querySelector('.loader'),
    infoMsg = document.querySelector('.info .msg'),
    lookupSection = document.querySelector('.lookup'),
    username = document.querySelector('.username'),
    balance = document.querySelector('.balance'),
    accountCreation = document.querySelector('.account-creation'),
    lastLogin = document.querySelector('.last-login'),
    verified = document.querySelector('.verified'),
    verifiedBy = document.querySelector('.verified-by'),
    verifiedDate = document.querySelector('.verified-date'),
    stakeAmount = document.querySelector('.stake-amount'),
    stakeDate = document.querySelector('.stake-date'),
    achievements = document.querySelector('.achievements'),
    items = document.querySelector('.items'),
    warnings = document.querySelector('.warnings'),
    transactionsTable = document.querySelector('#transactions_table table tbody'),
    server = document.querySelector('.server'),
    minersTable = document.querySelector('#miners table tbody'),
    infoUpdateToggleBtn = document.querySelector('.infoUpdateToggleBtn'),
    infoUpdateTime = document.querySelector('#infoUpdateTime');

let lookupUser = '',
    updateInfoTime = 5000,
    updateInfo = false;

infoUpdateTime.addEventListener('keydown', e => {
    if (e.key == 'Enter') {
        updateInfoTime = Number(infoUpdateTime.value);
    }
})

const urlSearchUsername = new URLSearchParams(window.location.search);

if (urlSearchUsername.get('username')) {
    lookupUser = urlSearchUsername.get('username')
    lookup(urlSearchUsername.get('username'))
}

function focusOnSearch() {
    search.focus();
}

search.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        lookupUser = search.value;
        lookup(search.value)
    }
})

let updateInfoInterval;

function toggleInfoUpdate() {
    if (updateInfo) {
        updateInfo = false;
        clearInterval(updateInfoInterval);
        infoUpdateToggleBtn.textContent = `🔴 Enable info updating`;
    } else {
        infoUpdateToggleBtn.textContent = `🟢 Disable info updating`;
        updateInfo = true;
        updateInfoInterval = setInterval(() => {
            if (lookupUser == '') {
                console.log('return')
                return
            } else {
                console.log('lookup')
                lookup(lookupUser, false);
            }
        }, updateInfoTime)
    }
}

function lookup(user, showAnim = true) {
    transactionsTable.innerHTML = '';
    minersTable.innerHTML = '';
    document.querySelector('#prices_box').innerHTML = '';
    fetch(`https://server.duinocoin.com/v2/users/${user}`).then(res => res.json()).then(data => {

        if (showAnim) {
            lookupSection.style.display = 'none';
            info.style.display = 'none';
            loader.style.display = 'flex';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 400)
        }

        if (data.success == false) {
            setTimeout(() => {
                info.style.display = 'flex';
            }, 450)
            infoMsg.textContent = data.message;
            return false;
        }

        infoMsg.textContent = 'Enter a username to lookup!';

        if (showAnim) {
            setTimeout(() => {
                lookupSection.style.display = 'block';
            }, 450);
        }

        setTimeout(() => {
            username.textContent = data.result.balance.username;
            balance.textContent = data.result.balance.balance + ' DUCO';
            accountCreation.textContent = data.result.balance.created;
            lastLogin.textContent = data.result.balance.last_login;
            verified.textContent = data.result.balance.verified;
            verifiedBy.textContent = data.result.balance.verified_by;
            verifiedDate.textContent = data.result.balance.verified_date;
            stakeAmount.textContent = data.result.balance.stake_amount;
            stakeDate.textContent = data.result.balance.stake_date;
            warnings.textContent = data.result.balance.warnings;
            server.textContent = data.server;
            achievements.textContent = (data.result.achievements.length == 0) ? "None" : data.result.achievements;
            items.textContent = (data.result.items.length == 0) ? "None" : data.result.items;
            const data_prices = data.result.prices,
                data_prices_keys = Object.keys(data_prices),
                data_prices_values = Object.values(data_prices);
            data_prices_keys.forEach(e => {
                document.querySelector('#prices_box').innerHTML += `
                <li>${e}: ${data_prices[e]}</li>`
            })
            chart1('chart_prices', 'Prices', data_prices_keys, data_prices_values);
            const transactions_length = data.result.transactions.length;
            if (transactions_length == 0) {
                transactionsTable.innerHTML = `
                <h6 style="padding:1rem 1rem .3rem 1rem;opacity:.8">No transactions</h6>`
            } else {
                let transactions_count = 1;
                data.result.transactions.forEach(e => {
                    transactionsTable.innerHTML += `
                    <tr>
                        <th scope="row">${transactions_count}</th>
                        <td>${e.datetime}</td>
                        <td>${e.sender}</td>
                        <td>${e.recipient}</td>
                        <td>${e.amount}</td>
                        <td>${e.hash}</td>
                        <td>${e.id}</td>
                        <td>${e.memo}</td>
                    </tr>`
                    transactions_count++;
                })
            }
            let miners_len = data.result.miners.length;
            if (miners_len == 0) {
                minersTable.innerHTML = `<h6 style="padding:1rem 1rem .3rem 1rem;opacity:.8;">No&nbsp;active&nbsp;miners</h6>`
            } else {
                let miners_count = 1,
                    miners_sharetime = 0,
                    miners_accepted = 0,
                    miners_rejected = 0,
                    miners_hashrate = 0,
                    miners_diff = 0,
                    miners_ki = 0,
                    miners_pg = 0,
                    miners_wd = 0;
                data.result.miners.forEach(e => {
                    minersTable.innerHTML += `
                    <tr>
                        <th scope="row">${miners_count}</th>
                        <td>${e.software}</td>
                        <td>${e.algorithm}</td>
                        <td>${e.sharetime.toFixed(3)}</td>
                        <td>${e.accepted}</td>
                        <td>${e.rejected}</td>
                        <td>${e.hashrate}&nbsp;H/s</td>
                        <td>${e.diff}</td>
                        <td>${e.identifier}</td>
                        <td>${e.username}</td>
                        <td>${e.threadid}</td>
                        <td>${e.pool}</td>
                        <td>${e.it}</td>
                        <td>${e.ki}</td>
                        <td>${e.pg}</td>
                        <td>${e.wd}</td>
                    </tr>`
                    miners_sharetime += e.sharetime;
                    miners_accepted += e.accepted;
                    miners_rejected += e.rejected;
                    miners_hashrate += e.hashrate;
                    miners_diff += e.diff;
                    miners_ki += e.ki,
                        miners_pg += e.pg,
                        miners_wd += Number(e.wd);
                    if (miners_count == miners_len) {
                        minersTable.innerHTML += `
                        <tr>
                            <th scope="row"></th>
                            <td><strong>TOTAL</strong></td>
                            <td></td>
                            <td>${miners_sharetime.toFixed(3)}</td>
                            <td>${miners_accepted}</td>
                            <td>${miners_rejected}</td>
                            <td>${miners_hashrate}&nbsp;H/s</td>
                            <td>${miners_diff}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>${miners_ki}</td>
                            <td>${miners_pg}</td>
                            <td>${miners_wd}</td>
                        </tr>`
                    }
                    miners_count++;
                })
            }
        }, 500);
    })
}

// Charts

function chart1(elem, label, labels, data) {
    e1 = document.getElementById(elem);
    e1.innerHTML = '';
    const e = document.createElement('canvas');
    e1.append(e);

    const ctx = e;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderWidth: 2,
                borderSkipped: false,
                borderColor: '#FF6787',
                backgroundColor: '#FFB1C1',
                borderRadius: 15
            }]
        },
        options: {
            responsive: true,
            animation: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}
