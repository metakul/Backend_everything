// // SPDX-License-Identifier: MIT
// pragma solidity >=0.5.0 <0.9.0;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";
// import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
// import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
// import "@uniswap/v2-periphery/contracts/interfaces/IERC20.sol";
// import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

// contract FlashSwap is Ownable, IUniswapV2Callee {
//     address public factoryV2;

//     constructor(address _factoryV2) {
//         factoryV2 = _factoryV2;
//     }

//     // Allow the owner to submit tokens to the contract
//     function submit(address token, uint256 amount) external onlyOwner {
//         require(amount > 0, "Amount must be greater than 0");
//         IERC20(token).transferFrom(msg.sender, address(this), amount);
//     }

//     // Allow the owner to withdraw tokens from the contract
//     function withdraw(address token, uint256 amount) external onlyOwner {
//         require(amount > 0, "Amount must be greater than 0");
//         IERC20(token).transfer(msg.sender, amount);
//     }

//     // Initiate a flash loan
//     function flashLoan(
//         address pairAddress,
//         uint256 amount0Out,
//         uint256 amount1Out,
//         address tokenToSwapTo,
//         uint256 minAmountOut
//     ) external onlyOwner {
//         IUniswapV2Pair(pairAddress).swap(
//             amount0Out,
//             amount1Out,
//             address(this), // Flash swap receiver
//             abi.encode(tokenToSwapTo, minAmountOut)
//         );
//     }

//     // Uniswap V2 callback function
//     function uniswapV2Call(
//         address sender,
//         uint256 amount0,
//         uint256 amount1,
//         bytes calldata data
//     ) external override {
//         require(sender == address(this), "Unauthorized");

//         // Decode data passed in the swap
//         (address tokenToSwapTo, uint256 minAmountOut) = abi.decode(
//             data,
//             (address, uint256)
//         );

//         // Determine the token borrowed and its amount
//         address tokenBorrowed;
//         uint256 amountBorrowed;

//         if (amount0 > 0) {
//             tokenBorrowed = IUniswapV2Pair(msg.sender).token0();
//             amountBorrowed = amount0;
//         } else {
//             tokenBorrowed = IUniswapV2Pair(msg.sender).token1();
//             amountBorrowed = amount1;
//         }

//         // Approve Uniswap Router to spend the borrowed token
//         IERC20(tokenBorrowed).approve(msg.sender, amountBorrowed);

//         // Perform the swap logic
//         address;
//         path[0] = tokenBorrowed;
//         path[1] = tokenToSwapTo;

//         // Replace with your Uniswap Router address
//         address router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

//         uint256[] memory amounts = IUniswapV2Router02(router)
//             .swapExactTokensForTokens(
//                 amountBorrowed,
//                 minAmountOut,
//                 path,
//                 address(this),
//                 block.timestamp
//             );

//         // Calculate repayment amount with Uniswap's 0.3% fee
//         uint256 repaymentAmount = (amountBorrowed * 1000) / 997 + 1;

//         // Ensure sufficient funds to repay the loan
//         require(
//             amounts[amounts.length - 1] >= repaymentAmount,
//             "Insufficient output"
//         );

//         // Repay the loan
//         IERC20(tokenBorrowed).transfer(msg.sender, repaymentAmount);

//         // Retain the remaining profit in the contract
//     }
// }
