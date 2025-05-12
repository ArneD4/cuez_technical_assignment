<script>
  import { onMount } from "svelte";
  import { calculateTimings } from "$lib/calculateTimings";

  let episodeData = {};
  let timingsData = {};
  let calculatedTimings = {};

  onMount(async () => {
    const episodeResponse = await fetch("/episode.json");
    const timingsResponse = await fetch("/timings.json");

    episodeData = await episodeResponse.json();
    timingsData = await timingsResponse.json();

    calculatedTimings = calculateTimings(episodeData, timingsData);
  });

  // State to track which part is expanded
  let expandedParts = {};
</script>

<div class="bg-blue-500 text-white p-4">Hello, Tailwind CSS!</div>

<div class="space-y-6">
  <!-- Table Header -->
  <div
    class="grid grid-cols-7 gap-1 text-sm font-semibold text-gray-700 border-b border-gray-300 whitespace-nowrap"
  >
    <div class="p-3"></div>
    <div class="p-3"></div>
    <div class=" p-3"></div>
    <div class="border-r border-gray-300 p-3">Est. Duration</div>
    <div class="border-r border-gray-300 p-3">Front Time</div>
    <div class="border-r border-gray-300 p-3">End Time</div>
    <div class="p-3">Back Time</div>
  </div>
  {#if calculatedTimings.parts}
    {#each calculatedTimings.parts as part, partIndex}
      <div class="border border-gray-300 shadow-md">
        <!-- Part Header -->
        <div
          class="space-y-6 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-t-lg w-full"
          on:click={() => (expandedParts[part.id] = !expandedParts[part.id])}
        >
          <div class="text-sm text-gray-600">
            <div class="grid grid-cols-7 gap-4 text-sm text-gray-600">
              <div></div>
              <div class="flex items-center space-x-2">
                <svg
                  class="w-4 h-4 transform trnsition-transform"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  class:rotate-0={expandedParts[part.id]}
                  class:rotate-270={!expandedParts[part.id]}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span class="font-semibold text-lg text-gray-800">PART</span>
              </div>
              <div class="font-bold p-3">{part.title}</div>
              <div class="border-r border-gray-300 p-3">
                {part.estimated_duration}
              </div>
              <div class="border-r border-gray-300 p-3">{part.front_time}</div>
              <div class="border-r border-gray-300 p-3">{part.end_time}</div>
              <div class="p-3">{part.back_time}</div>
            </div>
          </div>
        </div>

        <!-- Items (Dropdown) -->
        {#if expandedParts[part.id]}
          <div>
            <!-- Table Rows -->
            {#each part.items as item, itemIndex}
              <div
                class="grid grid-cols-7 gap-4 text-sm text-gray-600 m-2 bg-white border border-gray-300 rounded-lg shadow-sm"
              >
              <div class="p-3">{itemIndex + 1}</div>
                <div class="flex items-center space-x-2 p-3">
                    <span class="bg-gray-400 text-white rounded-md p-1"
                      >
                      ITEM {itemIndex + 1}</span>

                </div>
                <div class="font-bold p-3">{item.title}</div>
                <div class="border-r border-gray-300 p-3">{item.estimated_duration}</div>
                <div class="border-r border-gray-300 p-3">{item.front_time}</div>
                <div class="border-r border-gray-300 p-3">{item.end_time}</div>
                <div class="p-3">{item.back_time}</div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
