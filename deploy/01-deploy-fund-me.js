 
//  usually

//  import
//  main
//  call of main

// or

// function deployFunc(hre) {
//     console.log("Hi")
//     hre.getNamedAccounts
//     hre.deployments
// }

// module.exports.default = deployFunc

//or

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre
// }

// or

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { getNamedAccounts, deployments, network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        // or 
        // const { deploy, log, get } = deployments
        // const ethUsdAggregator = await get("MockV3Aggregator")

        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        // if we're not on a development chain, if we didn't deploy mock
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")

    const args = [ethUsdPriceFeedAddress]
    // when going for localhost or hardhat network we want to use a mock
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // for constructor
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    // we dont want to verify on a local network

}

module.exports.tags = ["all", "fundme"]