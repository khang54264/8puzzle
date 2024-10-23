import React from 'react';

const Puzzle = ({ state, imgurl }) => {
  const tileSize = 100; // Kích thước mảnh ghép tính bằng pixel
  const imageUrl = imgurl; // URL của bức ảnh bạn muốn sử dụng
    
  const getTilePosition = (tile, index) => {
    if (tile === 0) {
      // Nếu là ô trống thì không hiển thị hình ảnh nền
      return {
        transform: `translate(${(index % 3) * tileSize}px, ${Math.floor(index / 3) * tileSize}px)`,
        backgroundImage: 'none', // Không có ảnh nền cho ô trống
      };
    }
  
    // Tính toán vị trí gốc của mảnh ghép đúng trong bức ảnh
    const correctRow = Math.floor((tile - 1) / 3); // Hàng chính xác của mảnh ghép (0-based)
    const correctCol = (tile - 1) % 3; // Cột chính xác của mảnh ghép (0-based)
  
    // Vị trí hiện tại của mảnh ghép
    const currentRow = Math.floor(index / 3);
    const currentCol = index % 3;
  
    return {
      // Di chuyển mảnh ghép tới vị trí hiện tại
      transform: `translate(${currentCol * tileSize}px, ${currentRow * tileSize}px)`,
      
      // Vị trí cắt ảnh nền từ ảnh gốc, dựa trên vị trí đúng của mảnh ghép
      backgroundPosition: `-${correctCol * tileSize}px -${correctRow * tileSize}px`,
      backgroundImage: `url(${imageUrl})`,
    };
  };


  return (
    <div
      style={{
        width: `${tileSize * 3}px`,
        height: `${tileSize * 3}px`,
        position: 'relative',
        margin: '20px auto',
        border: '2px solid black',
        boxSizing: 'border-box',
      }}
    >
      {state.map((tile, index) => (
        <div
          key={index}
          style={{
            ...getTilePosition(tile, index),
            width: `${tileSize}px`,
            height: `${tileSize}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            transition: 'transform 0.3s ease-in-out',
            border: '1px solid black',
            backgroundColor: tile === 0 ? 'lightgray' : 'transparent', // Để mảnh trống hiển thị nền ảnh
            fontSize: '24px',
            backgroundSize: `${tileSize * 3}px ${tileSize * 3}px`, // Kích thước bức ảnh để cắt
          }}
        >
          {tile !== 0 && tile} {/* Hiển thị số trên các ô không rỗng */}
        </div>
      ))}
    </div>
  );
};

export default Puzzle;
