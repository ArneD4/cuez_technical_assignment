/**
 * @param {any} episodeData - The episode data object.
 * @param {any} timingData - The timing data object.
 * @returns {any} - The structured episode object.
 */

export function calculateTimings(episodeData, timingData) {
  const { episode, part, item } = timingData;

  const onAirTime = episode.on_air_time  * 1000;
  const offAirTime = episode.off_air_time  * 1000;

  let currentTime = onAirTime;

  const formatTime = (milliseconds) => {
    const date = new Date(milliseconds);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Create a structured episode object
  const structuredEpisode = {
    id: episodeData.episode.id,
    title: episodeData.episode.title,
    on_air_time: formatTime(onAirTime),
    off_air_time: formatTime(offAirTime),
    parts: [],
  };

  // Iterate over parts in the episode
  episodeData.episode.parts.forEach((partId) => {
    const currentPart = episodeData.part[partId];
    const timingPart = part[partId];

    // error handling for missing data
    if (!currentPart || !timingPart) {
      console.error(`Part data missing for partId: ${partId}`);
      return;
    }

    // Add items to the part
    const items = currentPart.items
      .map((itemId) => {
        const currentItem = episodeData.item[itemId];
        const timingItem = item[itemId];

        // error handling for missing data
        if (!currentItem || !timingItem) {
          console.error(`Item data missing for itemId: ${itemId}`);
          return null;
        }

        // Calculate item timings
        const itemFrontTime = currentTime;
        const itemEndTime = itemFrontTime + timingItem.estimated_duration;
        const itemBackTime = itemEndTime - timingItem.estimated_duration;

        // Update current time for the next item
        currentTime = itemEndTime;

        return {
          id: currentItem.id,
          title: currentItem.title,
          estimated_duration: formatTime(timingItem.estimated_duration ),
          front_time: formatTime(itemFrontTime),
          end_time: formatTime(itemEndTime),
          back_time: formatTime(itemBackTime),
        };
      })
      .filter(Boolean); // Remove null values

    if (items.length === 0) {
      console.error(`No valid items for partId: ${partId}`);
      return;
    }

    // Calculate part timings
    console.log(items[items.length - 1]);
    const partFrontTime = items[0]?.front_time || console.log(`No items found for partId: ${partId}`);
    const partEndTime = items[items.length - 1]?.end_time || console.log(`No items found for partId: ${partId}`);   
    const partBackTime = formatTime(currentTime - timingPart.estimated_duration);

    // console.log(`Adding part ${partId} with timings:`, {
    //         partFrontTime,
    //         partEndTime,
    //         partBackTime
    // });

    structuredEpisode.parts.push({
      id: currentPart.id,
      title: currentPart.title,
      estimated_duration: formatTime(timingPart.estimated_duration ),
      front_time: partFrontTime,
      end_time: partEndTime,
      back_time: partBackTime,
      items: items,
    });
  });

  return structuredEpisode;
}
