import React, { useCallback, useRef, useState } from 'react';
import { Button, View, StyleSheet, PanResponder } from 'react-native';
import { Canvas } from 'react-native-pytorch-core';

const DrawingComponent = ({ loadModelAndPredict }) => {
    const [drawingContext, setDrawingContext] = useState(null);
    const isDrawing = useRef(false);
    const strokePath = useRef([]);

    const handleContext2D = useCallback((ctx) => {
        setDrawingContext(ctx);
    }, []);

    const handleTouchStart = (event) => {
        if (!isDrawing.current) {
            const { locationX, locationY } = event.nativeEvent;
            strokePath.current = [];
            strokePath.current.push({ x: locationX, y: locationY });
            isDrawing.current = true;
            drawPath();
        }
    };

    const handleTouchMove = (event) => {
        if (isDrawing.current) {
            const { locationX, locationY } = event.nativeEvent;
            strokePath.current.push({ x: locationX, y: locationY });
            drawPath();
        }
    };

    const handleTouchEnd = () => {
        isDrawing.current = false;
    };

    const drawPath = () => {
        const ctx = drawingContext;
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(strokePath.current[0].x, strokePath.current[0].y);
            for (let i = 1; i < strokePath.current.length; i++) {
                ctx.lineTo(strokePath.current[i].x, strokePath.current[i].y);
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
        const ctx = drawingContext;
        if (ctx) {
            ctx.clear();
            ctx.invalidate().then(() => {});
        }
    };

    const classify = async () => {
        await loadModelAndPredict();
    };

    return (
        <>
            <View style={styles.container}>
                <Canvas style={StyleSheet.absoluteFill} onContext2D={handleContext2D} />
                <View {...panResponder.panHandlers} style={styles.touchArea} />
            </View>
            <View style={styles.button}>
                <Button title={'Classify Digit'} onPress={classify} />
                <Button title={'Clear'} onPress={clearDrawing} />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 6,
    },
    touchArea: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'transparent',
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
    },
});

export default DrawingComponent;
