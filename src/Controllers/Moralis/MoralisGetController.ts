/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import Moralis from 'moralis';

/**
 * Get tokenPrice 
*/

const MORALIS = process.env.MORALIS_API_KEY

Moralis.start({
    apiKey: MORALIS
});

export const tokenPrice = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        const { query } = req;
        const responseOne = await Moralis.EvmApi.token.getTokenPrice({
            address: query.addressOne as string
        })

        const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
            address: query.addressTwo as string
        })

        const usdPrices = {
            tokenOne: responseOne.raw.usdPrice,
            tokenTwo: responseTwo.raw.usdPrice,
            ratio: responseOne.raw.usdPrice / responseTwo.raw.usdPrice
        }

        return res.status(200).json(usdPrices);

    } catch (error) {
        return next(error);
    }
};

/**
 * Get single token price
 */
export const tokenPriceSingle = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        const { query } = req;
        console.log(query);
        
        const response = await Moralis.EvmApi.token.getTokenPrice({
            address: query.address as string
        })

        const usdPrice = {
            token: response.raw.usdPrice
        }

        return res.status(200).json(usdPrice);

    } catch (error) {
        return next(error);
    }
};

/**
 * Get multiple token prices
 */
export const tokenPriceMultiple = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        const { query } = req;
        const addresses = query.addresses as string[];
        const responses = await Promise.all(addresses.map(address => 
            Moralis.EvmApi.token.getTokenPrice({ address })
        ));

        const usdPrices = responses.map(response => ({
            usdPrice: response.raw.usdPrice
        }));

        return res.status(200).json(usdPrices);

    } catch (error) {
        return next(error);
    }
};