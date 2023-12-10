// SwitchInput.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme, Switch } from 'react-native-paper';

interface SwitchInputProps {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

const SwitchInput: React.FC<SwitchInputProps> = ({ label, value, onValueChange }) => {
    const theme = useTheme();

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Switch
                value={value}
                onValueChange={onValueChange}
                color={theme.colors.primary} // Adjust the color based on your theme
            />
            <Text style={{ marginLeft: 10 }}>{label}</Text>
        </View>
    );
};

export default SwitchInput;
