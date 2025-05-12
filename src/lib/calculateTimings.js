export function calculateTimings(episodeData, timingsData) {
    const { episode, part, item } = timingsData;

    // Convert on_air_time and off_air_time to milliseconds
    const onAirTime = episode.on_air_time * 1000;
    const offAirTime = episode.off_air_time * 1000;

    let currentTime = onAirTime;

    // Helper function to format time in hours:minutes:seconds
    const formatTime = (milliseconds) => {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Create a structured episode object
    const structuredEpisode = {
        id: episode.id,
        title: episode.title,
        on_air_time: formatTime(onAirTime),
        off_air_time: formatTime(offAirTime),
        estimated_duration: formatTime(episode.estimated_duration),
        parts: []
    };

    // Iterate over parts in the episode
    episodeData.episode.parts.forEach((partId) => {
        const currentPart = episodeData.part[partId];
        const timingPart = part[partId];

        if (!currentPart || !timingPart) {
            console.error(`Part data missing for partId: ${partId}`);
            return;
        }

        // Add items to the part
        const items = currentPart.items
            .map((itemId) => {
                const currentItem = episodeData.item[itemId];
                const timingItem = item[itemId];

                if (!currentItem || !timingItem) {
                    console.error(`Item data missing for itemId: ${itemId}`);
                    return null;
                }

                // Calculate item timings
                const itemFrontTime = currentTime;
                const itemEndTime = itemFrontTime + timingItem.estimated_duration;
                const itemBackTime = offAirTime - timingItem.estimated_duration;

                // Update current time for the next item
                currentTime = itemEndTime;

                return {
                    id: currentItem.id,
                    title: currentItem.title,
                    estimated_duration: formatTime(timingItem.estimated_duration),
                    front_time: formatTime(itemFrontTime),
                    end_time: formatTime(itemEndTime),
                    back_time: formatTime(itemBackTime)
                };
            })
            .filter(Boolean); // Remove null values

        if (items.length === 0) {
            console.error(`No valid items for partId: ${partId}`);
            return;
        }

        // Calculate part timings
        const partFrontTime = items[0]?.front_time || formatTime(currentTime);
        const partEndTime = items[items.length - 1]?.end_time || formatTime(currentTime);
        const partBackTime = formatTime(offAirTime);

        console.log(`Adding part ${partId} with timings:`, {
            partFrontTime,
            partEndTime,
            partBackTime
        });

        structuredEpisode.parts.push({
            id: currentPart.id,
            title: currentPart.title,
            estimated_duration: formatTime(timingPart.estimated_duration),
            front_time: partFrontTime,
            end_time: partEndTime,
            back_time: partBackTime,
            items
        });
    });

    console.log("Final structuredEpisode:", structuredEpisode);
    return structuredEpisode;
}