import React, { useCallback, useRef } from 'react';
import {StyleSheet, View, PanResponder, Button} from 'react-native';
import { Canvas } from 'react-native-pytorch-core';

export default function App() {
    const drawingContext = useRef(null);
    const isDrawing = useRef(false);
    const path = useRef([]);


    const handleContext2D = useCallback(
        async (ctx) => {
            drawingContext.current = ctx;
        },
        [],
    );

    const handleTouchStart = (event) => {
        if (!isDrawing.current) {
            const { locationX, locationY } = event.nativeEvent;
            path.current = [];
            path.current.push({ x: locationX, y: locationY });
            isDrawing.current = true;
            drawPath();
        }
    };

    const handleTouchMove = (event) => {
        if (isDrawing.current) {
            const { locationX, locationY } = event.nativeEvent;
            path.current.push({ x: locationX, y: locationY });
            drawPath();
        }
    };

    const handleTouchEnd = () => {
        isDrawing.current = false;
    };

    const drawPath = () => {
        const ctx = drawingContext.current;
        if (ctx) {
            ctx.beginPath();

            ctx.moveTo(path.current[0].x, path.current[0].y);

            for (let i = 1; i < path.current.length; i++) {
                ctx.lineTo(path.current[i].x, path.current[i].y);
            }

            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 10;
            ctx.stroke();
            ctx.closePath();
            ctx.invalidate().then(() => {});
        }
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: handleTouchStart,
        onPanResponderMove: handleTouchMove,
        onPanResponderRelease: handleTouchEnd,
        onPanResponderTerminate: handleTouchEnd,
    });

    const clearDrawing = () => {
        const ctx = drawingContext.current;
        if (ctx) {
            ctx.clear();
            ctx.invalidate().then(() => {});
        }
    }

    return (
        <>
            <View style={styles.container}>
                <Canvas style={StyleSheet.absoluteFill} onContext2D={handleContext2D} />
                <View {...panResponder.panHandlers} style={styles.touchArea} />
            </View>
            <View style={styles.button}>
                <Button title={"Classify Digit"}></Button>
                <Button title={"Clear"} onPress={clearDrawing}></Button>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'blue'
    },
    touchArea: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    button: {
        flex: 1
    }
});
