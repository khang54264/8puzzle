import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Modal, Image, TouchableOpacity  } from 'react-native';
import Puzzle from './Puzzle';

export default function App() {
  const [initialState, setInitialState] = useState([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [solution, setSolution] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [imageUrl, setImageUrl] = useState('./assets/aodai.jpg'); // URL của bức ảnh mặc định
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái hiển thị modal

  const imageOptions = {
    cat: require('./assets/meo.jpg'),
    khang: require('./assets/khang.jpg'),
    son: require('./assets/son.jpg'),
    aodai: require('./assets/aodai.jpg'),
    vietnam: require('./assets/vietnam.png'),
    halong: require('./assets/vinhhalong.jpg'),
  }; // Các URL của các hình ảnh

  // Tốc độ giải đố
  const speedLevels = [1000, 500, 200, 100];
  const [currentSpeedIndex, setCurrentSpeedIndex] = useState(0); // Biến chứa giá trị tốc độ

  //Hàm kiểm tra khoảng cách của 1 mảnh về vị trí ban đầu của nó
  const manhattanDistance = (state) => {
    const goalState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let distance = 0;
    for (let i = 0; i < state.length; i++) {
      if (state[i] !== 0) {
        const currentX = i % 3;
        const currentY = Math.floor(i / 3);
        const goalX = goalState.indexOf(state[i]) % 3;
        const goalY = Math.floor(goalState.indexOf(state[i]) / 3);
        distance += Math.abs(currentX - goalX) + Math.abs(currentY - goalY);
      }
    }
    return distance;
  };

  //Thuật toán tìm kiếm A*
  const astar = (initialState) => {
    const goalState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const openList = [];
    const closedList = new Set();

    const node = {
      state: initialState,
      parent: null,
      g: 0,
      h: manhattanDistance(initialState),
      f: 0,
    };
    node.f = node.g + node.h;
    openList.push(node);

    while (openList.length > 0) {
      openList.sort((a, b) => a.f - b.f);
      const currentNode = openList.shift();

      if (currentNode.state.join() === goalState.join()) {
        return reconstructPath(currentNode);
      }

      closedList.add(currentNode.state.join());

      const neighbors = getNeighbors(currentNode);

      neighbors.forEach((neighbor) => {
        if (!closedList.has(neighbor.state.join())) {
          neighbor.g = currentNode.g + 1;
          neighbor.h = manhattanDistance(neighbor.state);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = currentNode;

          const existingNode = openList.find(
            (node) => node.state.join() === neighbor.state.join()
          );

          if (!existingNode || neighbor.g < existingNode.g) {
            openList.push(neighbor);
          }
        }
      });
    }

    return [];
  };

  //Trả về đường đi giải đố
  const reconstructPath = (node) => {
    let path = [];
    while (node) {
      path.push(node.state);
      node = node.parent;
    }
    return path.reverse();
  };

  //Kiểm tra ô bên cạnh, kiểm tra ô trống
  const getNeighbors = (node) => {
    const { state } = node;
    const neighbors = [];
    const emptyIndex = state.indexOf(0);
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;
  
    const moves = [
      { rowChange: 0, colChange: -1 }, // trái
      { rowChange: 0, colChange: 1 },  // phải
      { rowChange: -1, colChange: 0 }, // lên
      { rowChange: 1, colChange: 0 },  // xuống
    ];
  
    moves.forEach((move) => {
      const newRow = row + move.rowChange;
      const newCol = col + move.colChange;
  
      // Kiểm tra di chuyển hợp lệ
      if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
        const newEmptyIndex = newRow * 3 + newCol;  // Vị trí mới của ô trống
        const newState = [...state];  // Tạo ra trạng thái mới
        // Đổi chỗ ô trống với ô bên cạnh
        [newState[emptyIndex], newState[newEmptyIndex]] = [
          newState[newEmptyIndex],
          newState[emptyIndex],
        ];
        neighbors.push({ state: newState });  // Lưu lại trạng thái mới này
      }
    });
  
    return neighbors;
  };

  //Kiểm tra trường hợp khả thi giải đố hay không khi shuffle
  const isSolvable = (puzzle) => {
    let inversions = 0;
    for (let i = 0; i < puzzle.length; i++) {
      for (let j = i + 1; j < puzzle.length; j++) {
        if (puzzle[i] && puzzle[j] && puzzle[i] > puzzle[j]) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  //Hàm xáo trộn puzzle
  const shufflePuzzle = () => {
    let shuffledState = [...initialState];
    do {
      for (let i = shuffledState.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledState[i], shuffledState[j]] = [shuffledState[j], shuffledState[i]];
      }
    } while (!isSolvable(shuffledState));
    setInitialState(shuffledState);
    setSolution([]); // Reset cách giải
    setCurrentStep(0); // Reset bước hiện tại
  };

  const solvePuzzle = () => {
    const path = astar(initialState);
    setSolution(path);
    setCurrentStep(0); // Reset bước hiện tại
  };

  // Animate cho các bước giải
  useEffect(() => {
    if (solution.length > 0 && currentStep < solution.length) {
      const timeout = setTimeout(() => {
        setInitialState(solution[currentStep]);
        setCurrentStep((prev) => prev + 1);
      }, speedLevels[currentSpeedIndex]); // Tốc độ giải đó
      return () => clearTimeout(timeout); // 
    }
  }, [solution, currentStep, currentSpeedIndex]);

  const increaseSpeed = () => {
    if (currentSpeedIndex < speedLevels.length - 1) {
      setCurrentSpeedIndex((prev) => prev + 1); // Tăng tốc độ giải
    }
  };

  const decreaseSpeed = () => {
    if (currentSpeedIndex > 0) {
      setCurrentSpeedIndex((prev) => prev - 1); // Giảm tốc độ giải
    }
  };

  const openImageSelection = () => {
    setIsModalVisible(true); // Hiển thị modal
  };

  const handleImageSelect = (imageKey) => {
    setImageUrl(imageOptions[imageKey]); // Cập nhật biến imageUrl với ảnh được chọn
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24 }}>8-Puzzle Solver</Text>
      <Puzzle state={initialState} imgurl={imageUrl}/>
      <Button title="Giải Puzzle" onPress={solvePuzzle} />
      <Button title="Xáo Trộn Puzzle" onPress={shufflePuzzle} />
      <Button title="Tăng tốc độ giải" onPress={increaseSpeed} disabled={currentSpeedIndex === speedLevels.length - 1} />
      <Button title="Giảm tốc độ giải" onPress={decreaseSpeed} disabled={currentSpeedIndex === 0} />
      <Button title="Chọn hình ảnh" onPress={openImageSelection} />
      <Text>Current Step: {currentStep} bước</Text>
      <Text>Current Speed: {speedLevels[currentSpeedIndex]/1000} giây/1 bước</Text>

      {/* Modal để chọn hình ảnh */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chọn hình ảnh</Text>
          <View style={styles.imageGrid}>
              <TouchableOpacity onPress={() => handleImageSelect('cat')}>
                <Image source={require('./assets/meo.jpg')} style={styles.imageOption} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleImageSelect('khang')}>
                <Image source={require('./assets/khang.jpg')} style={styles.imageOption} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleImageSelect('son')}>
                <Image source={require('./assets/son.jpg')} style={styles.imageOption} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleImageSelect('aodai')}>
                <Image source={require('./assets/aodai.jpg')} style={styles.imageOption} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleImageSelect('vietnam')}>
                <Image source={require('./assets/vietnam.png')} style={styles.imageOption} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleImageSelect('halong')}>
                <Image source={require('./assets/vinhhalong.jpg')} style={styles.imageOption} />
              </TouchableOpacity>
          </View>
          <Button title="Đóng" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageOption: {
    width: 100,
    height: 100,
    margin: 10,
  },
});
